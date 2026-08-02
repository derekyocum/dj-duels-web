import { useEffect, useState, useRef } from 'react'
import {
  ensureSpotifyPlaybackInitialized,
  getSpotifyPlaybackStatus,
  subscribeSpotifyPlaybackStatus,
  playSpotifyTrack,
  pauseSpotifyPlayback,
  reconcileSpotifyPlayback,
} from '../utils/spotifyWebPlayback'
import LoungeAvatar from './LoungeAvatar'

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
 * Spotify degrades honestly. Full tracks need the listener's OWN Premium
 * account connected with the streaming scope, which not everyone will have.
 * The room's timeline stays in sync regardless: a listener without it still
 * sees the art, the title and the progress bar moving with everyone else, and
 * gets told why they can't hear it — rather than the room silently desyncing.
 */
function NowPlaying({ current, startedAt, clockOffset = 0, skipVotes, skipVotesRequired, onSkipVote }) {
  const [spotifyStatus, setSpotifyStatus] = useState(getSpotifyPlaybackStatus())
  const [voted, setVoted] = useState(false)
  // 'ok' | 'corrected' | 'paused' | 'elsewhere' | 'idle' -- see
  // reconcileSpotifyPlayback. Only the last two are worth telling the user about.
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

  useEffect(() => {
    ensureSpotifyPlaybackInitialized()
    return subscribeSpotifyPlaybackStatus(setSpotifyStatus)
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

  // Start Spotify playback, seeking to wherever the room already is.
  useEffect(() => {
    if (source !== 'spotify' || spotifyStatus !== 'ready' || !track?.id) return
    if (startedTrackRef.current === current.id) return
    startedTrackRef.current = current.id
    playSpotifyTrack(track.id, Math.max(0, (Date.now() + clockOffset) - startedAt))
    // clockOffset/startedAt are read at start time only -- re-seeking on every
    // tick would fight the player instead of letting it run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, spotifyStatus, track?.id, current?.id])

  // Keep this listener on the room's timeline. Playback is started once per
  // track and then left alone, so without this nothing notices a buffer
  // leaving someone seconds behind, a pause from the Spotify phone app, or
  // another device quietly stealing playback.
  useEffect(() => {
    if (source !== 'spotify' || spotifyStatus !== 'ready' || !track?.id || !startedAt) return
    const id = setInterval(async () => {
      setSyncState(await reconcileSpotifyPlayback({
        trackId: track.id,
        expectedPositionMs: (Date.now() + clockOffset) - startedAt,
        durationMs,
      }))
    }, 5000)
    return () => clearInterval(id)
  }, [source, spotifyStatus, track?.id, startedAt, clockOffset, durationMs])

  // The SDK player is a persistent singleton, so it won't stop on its own when
  // the room runs dry or this page unmounts.
  useEffect(() => {
    if (!current) pauseSpotifyPlayback()
  }, [current])
  useEffect(() => () => pauseSpotifyPlayback(), [])

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
  const isSpotify = source === 'spotify'
  const spotifyPlayable = isSpotify && spotifyStatus === 'ready'
  // Someone whose audio has drifted off the room, or been taken over by
  // another device -- worth telling them, since everyone else plays on.
  const outOfSync = spotifyPlayable && (syncState === 'elsewhere' || syncState === 'paused')

  // Pulls playback back to this device at the room's current position.
  const rejoinRoom = () => {
    playSpotifyTrack(track.id, Math.max(0, (Date.now() + clockOffset) - startedAt))
    setSyncState('ok')
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
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-ember transition-[width] duration-500 ease-linear" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-text-muted text-xs tabular-nums shrink-0">
            {formatTime(positionMs)}{durationMs > 0 ? ` / ${formatTime(durationMs)}` : ''}
          </span>
        </div>

        {isSpotify && !spotifyPlayable && (
          <p className="mt-4 text-xs text-text-muted bg-card/60 border border-text-muted/15 rounded-xl px-4 py-3">
            Everyone else is hearing this on Spotify. Full tracks need your own
            Spotify Premium account connected —{' '}
            <a href="/profile" className="text-ember hover:underline">connect it on your profile</a>.
            The room keeps playing either way.
          </p>
        )}

        {outOfSync && (
          <div className="mt-4 flex items-center gap-3 text-xs bg-ember/10 border border-ember/25 rounded-xl px-4 py-3">
            <span className="flex-1 text-text-secondary">
              {syncState === 'elsewhere'
                ? 'Spotify is playing somewhere else — another device took over.'
                : 'Your playback is paused. The room kept going.'}
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
            <LoungeAvatar username={current.addedBy} size="sm" />
            <span className="text-text-muted text-xs truncate">{current.addedBy}&apos;s pick</span>
          </div>
          <button
            onClick={() => { setVoted(true); onSkipVote?.() }}
            disabled={voted}
            className="shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full bg-card/80 text-text-secondary border border-text-muted/25 hover:text-ember hover:border-ember/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voted ? `Skip · ${skipVotes}/${skipVotesRequired}` : 'Vote to skip'}
          </button>
        </div>
        {skipVotes > 0 && skipVotes < skipVotesRequired && (
          <p className="mt-2 text-right text-text-muted text-[11px]">
            {skipVotesRequired - skipVotes} more to skip
          </p>
        )}
      </div>
    </div>
  )
}

export default NowPlaying
