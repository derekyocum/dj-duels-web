import { useEffect, useState, useRef } from 'react'
import {
  ensureAppleMusicInitialized,
  getAppleMusicStatus,
  subscribeAppleMusicStatus,
  isAppleMusicAuthorized,
  playAppleMusicTrack,
  pauseAppleMusicPlayback,
  reconcileAppleMusicPlayback,
  authorizeAppleMusic,
} from '../utils/appleMusicPlayback'
import { addToAppleMusicLibrary } from '../utils/api'
import LoungeAvatar from './LoungeAvatar'

// Filled vs. outline heart -- drawn rather than an icon-library import, same
// idiom the app already uses for the landing page's info glyph.
function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.3 5 5.7 5c2 0 3.4 1.1 4.3 2.4C10.9 6.1 12.3 5 14.3 5c3.4 0 5.1 3.4 3.7 6.7C19.5 16.4 12 21 12 21z" strokeLinejoin="round" />
    </svg>
  )
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * The room's now-playing card, and the only place playback is actually started.
 *
 * Everyone renders against the SAME server timeline: position is
 * (serverNow - startedAt), so a late joiner seeks into the middle of the track
 * rather than restarting it. Nothing here tells the server what time it is —
 * the server is always the source of truth.
 *
 * Apple Music degrades honestly. Full tracks need the listener's OWN subscription
 * account connected with the streaming scope, which not everyone will have.
 * The room's timeline stays in sync regardless: a listener without it still
 * sees the art, the title and the progress bar moving with everyone else, and
 * gets told why they can't hear it — rather than the room silently desyncing.
 */
function NowPlaying({
  current, startedAt, clockOffset = 0, skipVotes, skipVotesRequired, onSkipVote,
  skipPaused = false, skipPausedBy, onSkipPause, onSkipProceed, avatars = {},
}) {
  const [appleMusicStatus, setAppleMusicStatus] = useState(getAppleMusicStatus())
  // 'ready' only means MusicKit has a developer token and is configured -- it
  // says nothing about THIS listener. Without also checking authorization,
  // playback was firing for everyone as soon as the SDK loaded, and MusicKit
  // was silently degrading to its own 30-second preview for anyone who'd never
  // connected -- indistinguishable from "full playback" without this flag.
  const [appleMusicAuthorized, setAppleMusicAuthorized] = useState(isAppleMusicAuthorized())
  const [voted, setVoted] = useState(false)
  // 'ok' | 'corrected' | 'paused' | 'idle' -- see
  // reconcileAppleMusicPlayback. Only the last two are worth telling the user about.
  const [syncState, setSyncState] = useState('ok')
  // The YouTube embed's ?start=, frozen per track. Deriving it from the ticking
  // clock changed the src string every second, so React kept mutating the live
  // iframe's src and reloading the player mid-song -- that was the pause loop.
  // Tracked with its own id (starting null) rather than folded into
  // votedForTrack below, because this MUST also compute on the first render:
  // votedForTrack deliberately starts equal to the current track, so a shared
  // guard would skip the initial freeze and drop a late joiner at 0:00 instead
  // of where the room actually is.
  const [youtubeStart, setYoutubeStart] = useState({ id: null, sec: 0 })
  // Lazy initializer so the clock read happens inside React's init, not during
  // render (Date.now() is impure). This ticking value — not a fresh Date.now()
  // call — is what drives the progress bar.
  const [now, setNow] = useState(() => Date.now())
  // Which track we've already told the player to start, so a re-render or a
  // roster change doesn't restart the song under everyone.
  const startedTrackRef = useRef(null)
  // Saving to Liked Songs is a plain REST call the server makes with the
  // caller's own token -- unlike playback, it works identically regardless of
  // Premium/SDK status, so this is independent of appleMusicStatus above.
  // `available` only turns true once a real liked-status check has succeeded;
  // there's already a "connect Apple Music" nudge for playback, so a second one
  // here (not-connected / needs-reconnect) would just be noise -- the heart
  // simply doesn't render for anyone that check fails for.
  const [addState, setAddState] = useState({ trackId: null, pending: false })
  // Lounges are open to everyone regardless of Apple Music status -- this just
  // tracks the in-flight "Connect Apple Music" button next to the not-playable
  // notice below, same full-navigation flow Profile's own connect uses.
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    ensureAppleMusicInitialized()
    return subscribeAppleMusicStatus((s) => {
      setAppleMusicStatus(s)
      if (s === 'ready') setAppleMusicAuthorized(isAppleMusicAuthorized())
    })
  }, [])

  // Local ticker purely for the progress bar; the authoritative timeline is
  // still startedAt from the server.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [])

  const track = current?.track
  const source = track?.source
  const positionMs = startedAt ? Math.max(0, (now + clockOffset) - startedAt) : 0
  // Declared up here (not after the early return below) because the sync
  // effect depends on it, and hooks must run before any conditional return.
  const durationMs = current?.durationMs ?? 0

  // Reset the "already voted" affordance when the track changes. React's
  // adjust-state-during-render pattern rather than an effect -- same approach
  // Stage already uses to adopt re-delivered server state.
  const [votedForTrack, setVotedForTrack] = useState(current?.id)
  if (current?.id !== votedForTrack) {
    setVotedForTrack(current?.id)
    setVoted(false)
    setSyncState('ok')
  }

  // positionMs already carries the room's offset and is pure (it reads the
  // ticking `now` state, not the clock directly).
  if (current?.id && youtubeStart.id !== current.id) {
    setYoutubeStart({ id: current.id, sec: Math.floor(positionMs / 1000) })
  }

  // Start Apple Music playback, seeking to wherever the room already is.
  useEffect(() => {
    if (source !== 'applemusic' || appleMusicStatus !== 'ready' || !appleMusicAuthorized || !track?.id) return
    if (startedTrackRef.current === current.id) return
    startedTrackRef.current = current.id
    playAppleMusicTrack(track.id, Math.max(0, (Date.now() + clockOffset) - startedAt))
    // clockOffset/startedAt are read at start time only -- re-seeking on every
    // tick would fight the player instead of letting it run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, appleMusicStatus, appleMusicAuthorized, track?.id, current?.id])

  // Keep this listener on the room's timeline. Playback is started once per
  // track and then left alone, so without this nothing notices a buffer
  // leaving someone seconds behind, a pause from another tab, or
  // another device quietly stealing playback.
  useEffect(() => {
    if (source !== 'applemusic' || appleMusicStatus !== 'ready' || !appleMusicAuthorized || !track?.id || !startedAt) return
    const id = setInterval(async () => {
      setSyncState(await reconcileAppleMusicPlayback({
        trackId: track.id,
        expectedPositionMs: (Date.now() + clockOffset) - startedAt,
        durationMs,
      }))
    }, 5000)
    return () => clearInterval(id)
  }, [source, appleMusicStatus, appleMusicAuthorized, track?.id, startedAt, clockOffset, durationMs])

  /**
   * One-way, because Apple's API is one-way: there is no supported endpoint to
   * remove a song from a library and no reliable way to ask whether one is
   * already there. So this cannot be the fill/unfill heart the old Spotify version
   * had -- an un-toggle would appear to work while doing nothing to the user's
   * actual library, which is worse than not offering it.
   *
   * `added` is therefore local session state, not fetched truth: it reflects
   * "you tapped this here", not "this is in your library".
   */
  const addToLibrary = async () => {
    if (!track?.id || addState.trackId === track.id) return
    setAddState({ trackId: track.id, pending: true })
    try {
      await addToAppleMusicLibrary(track.id)
      setAddState({ trackId: track.id, pending: false })
    } catch {
      setAddState({ trackId: null, pending: false })
    }
  }

  // The SDK player is a persistent singleton -- it does NOT stop on its own
  // when the room moves off Apple Music entirely. An Apple->Apple skip doesn't
  // need an explicit pause here: the "start playback" effect above calls
  // playAppleMusicTrack() for the new track, and the SDK's play() call already
  // replaces whatever was playing. But going to YouTube (or to nothing) has no
  // such call to hand off to, so without this the old Apple Music audio just kept
  // playing underneath the new YouTube embed -- both audible at once.
  useEffect(() => {
    if (!current || source !== 'applemusic') pauseAppleMusicPlayback()
  }, [current, source])
  useEffect(() => () => pauseAppleMusicPlayback(), [])

  if (!current) {
    return (
      <div className="rounded-3xl border border-ember/15 bg-card/40 px-6 py-12 text-center mb-6">
        <span className="text-4xl block mb-3">🕯️</span>
        <p className="text-text-primary font-semibold">Nothing playing</p>
        <p className="text-text-secondary text-sm mt-1">Queue something up and it starts right away.</p>
      </div>
    )
  }

  const progress = durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : 0
  const isAppleMusic = source === 'applemusic'
  const appleMusicPlayable = isAppleMusic && appleMusicStatus === 'ready' && appleMusicAuthorized
  // Someone whose audio has drifted off the room -- worth telling them,
  // since everyone else plays on. No 'elsewhere' case: MusicKit plays in
  // this page, so nothing can take playback away the way another Spotify
  // device could.
  const outOfSync = appleMusicPlayable && (syncState === 'paused')

  // Pulls playback back to this device at the room's current position.
  const rejoinRoom = () => {
    playAppleMusicTrack(track.id, Math.max(0, (Date.now() + clockOffset) - startedAt))
    setSyncState('ok')
  }

  /**
   * Connecting Apple Music never leaves the page.
   *
   * The Spotify version had to do a full-navigation OAuth handoff and land the
   * user back on /profile, which meant re-opening the lounge link afterwards
   * just to rejoin the room. MusicKit prompts in place, so someone can connect
   * mid-song and start hearing the room without losing their seat in it.
   */
  const connectAppleMusic = async () => {
    setConnecting(true)
    try {
      await authorizeAppleMusic()
      // Without this, appleMusicPlayable stayed false (it only re-derives on
      // an 'appleMusicStatus' transition, which authorizing doesn't trigger),
      // so playback would silently keep serving the preview after connecting.
      setAppleMusicAuthorized(true)
    } catch {
      // Declining the prompt is a normal choice, not an error to shout about.
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-ember/20 bg-card/50 overflow-hidden mb-6">
      {source === 'youtube' && track?.videoId && (
        <iframe
          // key on the queued-entry id so a new track remounts the player
          // instead of React mutating src in place (same reason the duel Stage
          // keys its embed -- a reused player misfires YouTube's guards).
          key={current.id}
          src={`https://www.youtube-nocookie.com/embed/${track.videoId}?autoplay=1&playsinline=1&rel=0&start=${youtubeStart.sec}`}
          title={track.name}
          className="w-full aspect-video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}

      <div className="p-6">
        <div className="flex items-center gap-4">
          {track?.albumArtUrl ? (
            <img src={track.albumArtUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-card-hover shrink-0 flex items-center justify-center text-2xl">🎵</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-ember text-[10px] uppercase tracking-widest font-semibold mb-0.5">Now playing</p>
            <p className="text-text-primary font-semibold truncate">{track?.name}</p>
            <p className="text-text-secondary text-sm truncate">{track?.artist}</p>
          </div>
          {/* Add-only, and the control says so. Once added it goes disabled
              rather than becoming an un-add, because Apple offers no removal --
              a button that looked like it could undo would be lying. */}
          {isAppleMusic && track?.id && (
            <button
              onClick={addToLibrary}
              disabled={addState.pending || addState.trackId === track.id}
              aria-label={addState.trackId === track.id ? 'Added to your Apple Music library' : 'Add to your Apple Music library'}
              title={addState.trackId === track.id ? 'Added to your Apple Music library' : 'Add to your Apple Music library'}
              className={`shrink-0 p-2 rounded-full border transition-colors ${
                addState.trackId === track.id
                  ? 'text-ember border-ember/30 bg-ember/15 cursor-default'
                  : 'text-text-muted border-text-muted/25 hover:text-ember hover:border-ember/40 cursor-pointer'
              } ${addState.pending ? 'opacity-50' : ''}`}
            >
              <HeartIcon filled={addState.trackId === track.id} />
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3">
          {/* Paused: a static dashed track instead of a filling bar, so it
              reads at a glance as "not counting down to a skip" rather than
              just stalled. */}
          {skipPaused ? (
            <div className="flex-1 h-1.5 rounded-full border border-dashed border-ember/40" />
          ) : (
            <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-ember transition-[width] duration-500 ease-linear" style={{ width: `${progress}%` }} />
            </div>
          )}
          <span className="text-text-muted text-xs tabular-nums shrink-0">
            {skipPaused ? 'Paused' : `${formatTime(positionMs)}${durationMs > 0 ? ` / ${formatTime(durationMs)}` : ''}`}
          </span>
        </div>

        {isAppleMusic && !appleMusicPlayable && (
          <div className="mt-4 flex items-center gap-3 text-xs bg-card/60 border border-text-muted/15 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">🎧</span>
            <span className="flex-1 text-text-muted">
              Connect Apple Music to listen along in sync — the room keeps playing either way.
            </span>
            <button
              onClick={connectAppleMusic}
              disabled={connecting}
              className="shrink-0 px-3 py-1.5 font-semibold rounded-full bg-ember/20 text-ember border border-ember/30 hover:bg-ember/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? 'Connecting…' : 'Connect Apple Music'}
            </button>
          </div>
        )}

        {outOfSync && (
          <div className="mt-4 flex items-center gap-3 text-xs bg-ember/10 border border-ember/25 rounded-xl px-4 py-3">
            <span className="flex-1 text-text-secondary">
              {'Your audio is paused — the room is still playing.'}
            </span>
            <button
              onClick={rejoinRoom}
              className="shrink-0 px-3 py-1.5 font-semibold rounded-full bg-ember/20 text-ember border border-ember/30 hover:bg-ember/30 transition-colors cursor-pointer"
            >
              Play here
            </button>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <LoungeAvatar
              username={current.addedBy}
              avatarId={avatars[current.addedBy]?.avatarId}
              avatarColor={avatars[current.addedBy]?.avatarColor}
              size="sm"
            />
            <span className="text-text-muted text-xs truncate">{current.addedBy}&apos;s pick</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {skipPaused ? (
              <button
                onClick={onSkipProceed}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-ember/20 text-ember border border-ember/40 hover:bg-ember/30 transition-colors cursor-pointer"
              >
                ▶ Proceed
              </button>
            ) : (
              <>
                {/* Nothing to pause on a track with no known duration -- it
                    already has no auto-advance deadline in the first place. */}
                {durationMs > 0 && (
                  <button
                    onClick={onSkipPause}
                    aria-label="Pause auto-skip"
                    title="Pause auto-skip"
                    className="px-2.5 py-1.5 text-xs rounded-full bg-card/80 text-text-secondary border border-text-muted/25 hover:text-ember hover:border-ember/40 transition-colors cursor-pointer"
                  >
                    ⏸
                  </button>
                )}
                <button
                  onClick={() => { setVoted(true); onSkipVote?.() }}
                  disabled={voted}
                  className="px-4 py-1.5 text-xs font-semibold rounded-full bg-card/80 text-text-secondary border border-text-muted/25 hover:text-ember hover:border-ember/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {voted ? `Skip · ${skipVotes}/${skipVotesRequired}` : 'Vote to skip'}
                </button>
              </>
            )}
          </div>
        </div>
        {skipPaused ? (
          <p className="mt-2 text-right text-text-muted text-[11px]">
            Auto-skip paused{skipPausedBy ? ` by ${skipPausedBy}` : ''} — rewound or not done yet
          </p>
        ) : skipVotes > 0 && skipVotes < skipVotesRequired ? (
          <p className="mt-2 text-right text-text-muted text-[11px]">
            {skipVotesRequired - skipVotes} more to skip
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default NowPlaying
