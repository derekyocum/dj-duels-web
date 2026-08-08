import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import DriftingOrbs from '../components/DriftingOrbs'
import RoundIntro from '../components/RoundIntro'
import AppNav from '../components/AppNav'
import Reconnecting from '../components/Reconnecting'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import { SuddenDeathBadge, SUDDEN_DEATH_BG } from '../components/SuddenDeathBanner'
import { FinalsBadge, FinalsGlow } from '../components/FinalsBadge'
import { orbColorsForRound } from '../utils/orbColors'
import { useAuth } from '../context/AuthContext'
import { useDuelSocket, useDuelEvents } from '../context/DuelSocketContext'
import { useAvatars } from '../utils/useAvatars'
import {
  ensureSpotifyPlaybackInitialized,
  getSpotifyPlaybackStatus,
  subscribeSpotifyPlaybackStatus,
  playSpotifyTrack,
  pauseSpotifyPlayback,
} from '../utils/spotifyWebPlayback'

// Module-level singleton: the Spotify iFrame API script should only ever be
// injected once per page, and every mount (including the key-forced remount
// for each new track) awaits the SAME promise for the IFrameAPI object --
// whichever mount asks first triggers the load, everyone else just waits on
// (or immediately gets, if it already resolved) the same result.
let spotifyIframeApiPromise = null
function loadSpotifyIframeApi() {
  if (spotifyIframeApiPromise) return spotifyIframeApiPromise
  spotifyIframeApiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => resolve(IFrameAPI)
    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    document.body.appendChild(script)
  })
  return spotifyIframeApiPromise
}

// There's no documented/reliable autoplay URL param for Spotify's classic
// embed (unlike YouTube's real autoplay=1) -- the &autoplay=1 the old <iframe
// src> carried was never guaranteed to do anything, and evidently doesn't in
// practice. Spotify does ship an official iFrame API for exactly this
// (developer.spotify.com/documentation/embeds/references/iframe-api): create
// a controller against a container element, then call .play() once it
// reports 'ready'. This correctly gets allow="autoplay; ..." delegated to the
// generated iframe automatically (confirmed via DOM inspection), so a missing
// permission isn't the issue.
//
// The real constraint is browser autoplay-gesture policy, and it varies a lot
// by browser: our .play() call fires from an async SDK 'ready' callback, not
// synchronously inside a click handler, which some browsers (Safari in
// particular -- it requires the play() call to be in the SAME call stack as
// the originating user gesture, no async gap allowed) will silently refuse
// regardless of any earlier click on the page. There's no code-level way to
// force a guarantee here across every browser, so instead of a silently
// stalled player we detect the stall (no playback_update reporting
// isPaused:false shortly after calling play()) and surface a one-tap
// fallback -- worst case this degrades to a single manual tap instead of
// nothing happening.
function SpotifyEmbed({ trackId }) {
  const containerRef = useRef(null)
  const controllerRef = useRef(null)
  const isPlayingRef = useRef(false)
  const [needsTap, setNeedsTap] = useState(false)

  useEffect(() => {
    let cancelled = false
    isPlayingRef.current = false
    loadSpotifyIframeApi().then((IFrameAPI) => {
      if (cancelled || !containerRef.current) return
      IFrameAPI.createController(
        containerRef.current,
        { uri: `spotify:track:${trackId}`, width: '100%', height: '352' },
        (EmbedController) => {
          if (cancelled) return
          controllerRef.current = EmbedController
          EmbedController.addListener('playback_update', (e) => {
            isPlayingRef.current = !e.data.isPaused
            if (!e.data.isPaused) setNeedsTap(false)
          })
          EmbedController.addListener('ready', () => {
            EmbedController.play()
            setTimeout(() => {
              if (!cancelled && !isPlayingRef.current) setNeedsTap(true)
            }, 1200)
          })
        }
      )
    })
    return () => { cancelled = true; controllerRef.current = null }
  }, [trackId])

  return (
    <div className="relative">
      <div ref={containerRef} />
      {needsTap && (
        <button
          onClick={() => { controllerRef.current?.play(); setNeedsTap(false) }}
          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 text-white font-semibold text-sm rounded-2xl cursor-pointer"
        >
          <span className="text-xl">▶</span> Tap to play
        </button>
      )}
    </div>
  )
}

const COLOR_TEXT = {
  'neon-blue': 'text-neon-blue',
  'neon-pink': 'text-neon-pink',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
  'neon-yellow': 'text-neon-yellow',
}

const COLOR_GLOW = {
  'neon-blue': 'shadow-[0_0_40px_rgba(0,128,255,0.25)]',
  'neon-pink': 'shadow-[0_0_40px_rgba(255,45,149,0.25)]',
  'neon-purple': 'shadow-[0_0_40px_rgba(139,47,232,0.25)]',
  'neon-green': 'shadow-[0_0_40px_rgba(57,255,20,0.25)]',
  'neon-yellow': 'shadow-[0_0_40px_rgba(255,240,31,0.25)]',
}

// Fallback only. The real per-song length is the host's Song Play Time rule
// (settings.songLengthLimit); the server already builds songEndsAt from it, so
// this is what's used when there's no rule set and as the progress-bar scale.
const DEFAULT_TRACK_SECONDS = 90

// How long the opening "Semifinal — Alice vs Bob" card holds before audio
// starts. MUST stay in step with the server's STAGE_INTRO_MS (GameController):
// songEndsAt is absolute, so anything longer than the server's cushion is
// playback time silently taken off the track.
const ROUND_INTRO_MS = 3000
// The quieter beat between the two songs of the same match -- no title card,
// so it stays short and is covered by the server's NAV_GRACE_MS.
const SONG_SWAP_MS = 1500

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function AudienceMember({ player, isCurrentPerformer, hasVoted, avatars = {} }) {
  const avatar = avatars[player.name]

  return (
    <div className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isCurrentPerformer ? 'scale-110' : 'opacity-60'}`}>
      <div className={`relative rounded-full ${isCurrentPerformer ? 'ring-2 ring-neon-blue/40' : ''}`}>
        <Avatar username={player.name} avatarId={avatar?.avatarId} avatarColor={avatar?.avatarColor} size={40} />
        {hasVoted && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-green border border-midnight flex items-center justify-center text-[8px] font-bold text-midnight">✓</span>
        )}
      </div>
      <span className="text-text-muted text-xs truncate max-w-[60px]">{player.name}</span>
    </div>
  )
}

function Stage() {
  const { duelId, roundNum } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    player1, player2, track1, track2,
    allPlayers = [], trackHistory = {},
    roundLabel, bracket,
  } = location.state ?? {}
  const round = parseInt(roundNum, 10)
  const avatars = useAvatars([player1?.name, player2?.name, ...allPlayers.map((p) => p.name)])
  // 1+ when this match is a tiebreak replay; drives the darker treatment.
  const suddenDeathRound = location.state?.suddenDeathRound ?? 0
  const isSuddenDeath = suddenDeathRound > 0
  const isFinalSuddenDeath = location.state?.isFinalSuddenDeath ?? false
  const isFinals = roundLabel === 'Final' && !isSuddenDeath
  // The host's Song Play Time rule. The authoritative countdown still comes from
  // the server's songEndsAt; this scales the progress bar and covers the
  // no-server-timestamp fallback.
  const trackSeconds = location.state?.settings?.songLengthLimit ?? DEFAULT_TRACK_SECONDS

  const [phase, setPhase] = useState('intro')
  // 'round' -> the full title card, shown once when the match opens.
  // 'song'  -> the quiet fade between the two songs of that same match.
  const [introKind, setIntroKind] = useState('round')
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => location.state?.currentSongIndex ?? 0)
  const [vote, setVote] = useState(null)
  const [trackTimeLeft, setTrackTimeLeft] = useState(trackSeconds)
  const [songStopped, setSongStopped] = useState(false)
  const [skipRequested, setSkipRequested] = useState(false)
  // songIndex -> { up, down, voterCount, totalPlayers, voters[] }
  const [serverSongVotes, setServerSongVotes] = useState({})
  // songIndex -> { requestedCount, totalPlayers } -- skip needs everyone's agreement
  const [serverSkipRequests, setServerSkipRequests] = useState({})
  // Server-authoritative end timestamp for the current song; syncs all clients
  const [songEndsAt, setSongEndsAt] = useState(location.state?.songEndsAt ?? null)
  // When a match ends but the tournament continues: { winnerName, nextLabel } for
  // the "X advances!" interstitial shown before routing to the next faceoff.
  const [advanceInfo, setAdvanceInfo] = useState(null)
  // Set instead of advanceInfo when the match TIED: nobody advanced, so the
  // interstitial announces a tiebreak rather than a winner.
  const [tiebreakInfo, setTiebreakInfo] = useState(null)

  const tracks = [
    { track: track1, player: player1, key: 'player1' },
    { track: track2, player: player2, key: 'player2' },
  ]
  const current = tracks[currentTrackIndex]

  // 'connecting' | 'ready' | 'unavailable' -- the singleton starts a
  // connectivity check on the very first Stage mount of the session and stays
  // that way; every later mount just reads/subscribes to its current status.
  const [spotifyPlaybackStatus, setSpotifyPlaybackStatus] = useState(getSpotifyPlaybackStatus())
  useEffect(() => {
    ensureSpotifyPlaybackInitialized()
    return subscribeSpotifyPlaybackStatus(setSpotifyPlaybackStatus)
  }, [])

  // If we mounted without state (reconnect / direct URL), wait for the server
  // snapshot to route + rehydrate us before giving up.
  useEffect(() => {
    if (player1 && player2 && track1 && track2) return
    const t = setTimeout(() => navigate('/', { replace: true }), 6000)
    return () => clearTimeout(t)
  }, [player1, player2, track1, track2, navigate])

  // Adopt the server's song position + deadline when state is (re)delivered on
  // resync (a new location.state object). These live in useState — unlike the
  // inline reads above — so we reconcile them here using React's "adjust state
  // during render" pattern rather than an effect.
  const [syncedState, setSyncedState] = useState(location.state)
  if (location.state !== syncedState) {
    setSyncedState(location.state)
    if (typeof location.state?.currentSongIndex === 'number') setCurrentTrackIndex(location.state.currentSongIndex)
    if (location.state?.songEndsAt) setSongEndsAt(location.state.songEndsAt)
  }

  const handleGameEvent = useCallback((event) => {
    switch (event.type) {
      case 'VOTE_UPDATE': {
        const { songIndex, tally, voterCount, totalPlayers, voters } = event.payload
        setServerSongVotes((prev) => ({
          ...prev,
          [songIndex]: { up: tally.up, down: tally.down, voterCount, totalPlayers, voters: voters || [] },
        }))
        break
      }
      case 'SKIP_UPDATE': {
        const { songIndex, requestedCount, totalPlayers } = event.payload
        setServerSkipRequests((prev) => ({
          ...prev,
          [songIndex]: { requestedCount, totalPlayers },
        }))
        break
      }
      case 'SONG_COMPLETE': {
        if (event.payload.songIndex !== 0) break
        setSongEndsAt(event.payload.nextSongEndsAt ?? null)
        setCurrentTrackIndex(1)
        setVote(null)
        setTrackTimeLeft(trackSeconds)
        setSongStopped(false)
        setSkipRequested(false)
        // Second song of the SAME match -- everyone already saw the round
        // card, so this is the short quiet beat, not another title screen.
        setIntroKind('song')
        setPhase('intro')
        setTimeout(() => setPhase('playing'), SONG_SWAP_MS)
        break
      }
      case 'SUDDEN_DEATH': {
        // The match tied, so nobody advanced -- the same two battlers go back to
        // song selection for another swing. round+1 only keeps the URL unique so
        // Faceoff remounts fresh; the real label still comes from the server.
        const p = event.payload
        setPhase('finished')
        setTiebreakInfo({
          round: p.suddenDeathRound,
          isFinal: p.isFinalSuddenDeath,
          tiedFire: p.tiedPlayer1Votes?.up,
        })
        setTimeout(() => {
          // Same stale-transition guard as NEXT_MATCH: a WS reconnect mid-
          // interstitial can resync us off Stage before this timer fires.
          if (!window.location.pathname.includes('/stage')) return
          navigate(`/duel/${duelId}/round/${round + 1}`, {
            state: {
              player1: p.player1,
              player2: p.player2,
              bracket: p.bracket,
              roundLabel: p.roundLabel,
              settings: p.settings,
              allPlayers: p.allPlayers,
              trackHistory,
              faceoffEndsAt: p.faceoffEndsAt,
              suddenDeathRound: p.suddenDeathRound,
              isFinalSuddenDeath: p.isFinalSuddenDeath,
              // The 🔥 count both tracks landed on, so the next screen can say
              // exactly why this is happening.
              tiedFire: p.tiedPlayer1Votes?.up,
            },
          })
        }, 2600)
        break
      }
      case 'NEXT_MATCH': {
        // A match finished but the tournament isn't over. Record the match
        // winner's track (so the champion's "winning set" builds up across the
        // bracket), show a brief interstitial, then route everyone to the next
        // match's faceoff. round+1 keeps the URL unique so screens remount fresh.
        const { prevWinnerName, player1: np1, player2: np2, roundLabel: nextLabel,
                bracket: nextBracket, settings, allPlayers: nextAll, faceoffEndsAt } = event.payload
        const matchWinnerTrack = prevWinnerName === player1?.name ? track1 : track2
        const carried = { ...trackHistory }
        if (prevWinnerName) {
          carried[prevWinnerName] = [...(carried[prevWinnerName] || []), matchWinnerTrack]
        }
        setPhase('finished')
        setAdvanceInfo({ winnerName: prevWinnerName, nextLabel, np1, np2 })
        setTimeout(() => {
          // A brief WS reconnect during this interstitial can trigger a resync
          // that jumps to Faceoff before this timer fires (the server already
          // flips phase to FACEOFF as part of advancing the match, so the
          // reconnect's snapshot looks identical to what this timer is about to
          // do). Bail if we've already navigated off Stage -- mirrors the
          // mobile StageScreen guard, where the equivalent race actually crashed
          // the app; here it would just be a redundant/confusing navigation.
          if (!window.location.pathname.includes('/stage')) return
          navigate(`/duel/${duelId}/round/${round + 1}`, {
            state: {
              player1: np1,
              player2: np2,
              bracket: nextBracket,
              roundLabel: nextLabel,
              settings,
              allPlayers: nextAll,
              trackHistory: carried,
              faceoffEndsAt,
            },
          })
        }, 2600)
        break
      }
      case 'ROUND_COMPLETE': {
        const { winnerName, loserName, winnerVotes, loserVotes, winnerTrophies, bracket: finalBracket } = event.payload
        setPhase('finished')
        const winner = winnerName === player1?.name ? player1 : player2
        const loser = loserName === player1?.name ? player1 : player2
        const winnerTrack = winner === player1 ? track1 : track2
        const newTrackHistory = { ...trackHistory }
        if (!newTrackHistory[winner?.name]) newTrackHistory[winner?.name] = []
        newTrackHistory[winner?.name] = [...newTrackHistory[winner?.name], winnerTrack]
        // Straight to Champion after the tally pause -- the interstitial
        // RoundWinner page is gone; its vote-count reveal now lives on the
        // Champion page's participants row (counts stay anonymous until here).
        setTimeout(() => {
          // Same stale-transition guard as NEXT_MATCH above.
          if (!window.location.pathname.includes('/stage')) return
          navigate(`/duel/${duelId}/champion`, {
            state: {
              champion: winner,
              loser,
              winnerVotes: { up: winnerVotes.up, down: winnerVotes.down },
              loserVotes: { up: loserVotes.up, down: loserVotes.down },
              // Server-awarded lifetime trophy total for the winner (-1 if the
              // stats write failed -- Champion treats that as "unknown" and hides it)
              winnerTrophies,
              allPlayers,
              trackHistory: newTrackHistory,
              bracket: finalBracket,
            },
          })
        }, 2000)
        break
      }
      default:
        break
    }
  }, [player1, player2, track1, track2, trackHistory, duelId, allPlayers, navigate, round, trackSeconds])

  const { send } = useDuelSocket()
  useDuelEvents(handleGameEvent)

  // Opening title card → playing. Longer than the between-songs beat because
  // this one actually shows something (see RoundIntro).
  useEffect(() => {
    const timer = setTimeout(() => setPhase('playing'), ROUND_INTRO_MS)
    return () => clearTimeout(timer)
  }, [])

  // Countdown — recalculates from server timestamp each second so all clients stay in lockstep.
  // Falls back to local decrement if no server timestamp (offline/test).
  useEffect(() => {
    if (phase !== 'playing') return
    const tick = songEndsAt
      ? () => setTrackTimeLeft(Math.max(0, Math.round((songEndsAt - Date.now()) / 1000)))
      : () => setTrackTimeLeft((t) => (t > 0 ? t - 1 : 0))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [phase, songEndsAt])

  // When timer hits 0: auto-cast a down vote via server if player hasn't voted yet.
  // The server drives the actual song advance via SONG_COMPLETE / ROUND_COMPLETE.
  // songStopped in deps prevents double-fire on re-render.
  useEffect(() => {
    if (trackTimeLeft > 0 || phase !== 'playing' || songStopped) return
    const t = setTimeout(() => {
      setSongStopped(true)
      if (!vote) {
        setVote('down')
        send('round/vote', { duelId, voterUsername: user?.username, songIndex: currentTrackIndex, vote: 'down' })
      }
    }, 0)
    return () => clearTimeout(t)
  }, [trackTimeLeft, phase, vote, songStopped, send, duelId, user?.username, currentTrackIndex])

  const isSpotify = current?.track?.source === 'spotify' && !!current?.track?.id

  // Starts the current track once the SDK device is confirmed ready. If the
  // singleton settles into 'ready' mid-track (a race only possible on the
  // first Spotify track of a session, since every later track already has a
  // settled status), this fires and the iframe-fallback JSX below unmounts in
  // the same render -- a brief hiccup, not worth extra state to avoid.
  useEffect(() => {
    if (phase === 'playing' && isSpotify && spotifyPlaybackStatus === 'ready') {
      playSpotifyTrack(current.track.id)
    }
  }, [phase, isSpotify, spotifyPlaybackStatus, current?.track?.id])

  // Headless SDK playback doesn't stop on its own the way the iframe does on
  // unmount -- explicitly pause whenever this track's window ends (timeout,
  // skip) or the phase leaves 'playing', so audio doesn't run into the next
  // track or bleed into Champion. Also pause on Stage unmount itself.
  useEffect(() => {
    if (songStopped || phase !== 'playing') pauseSpotifyPlayback()
  }, [songStopped, phase])
  useEffect(() => () => pauseSpotifyPlayback(), [])

  function handleVote(direction) {
    if (vote) return
    setVote(direction)
    send('round/vote', { duelId, voterUsername: user?.username, songIndex: currentTrackIndex, vote: direction })
  }

  function handleSkip() {
    if (skipRequested) return
    setSkipRequested(true)
    send('round/skip', { duelId })
  }

  const color = current?.player?.color || 'neon-blue'
  const textClass = COLOR_TEXT[color] || COLOR_TEXT['neon-blue']
  const glowClass = COLOR_GLOW[color] || COLOR_GLOW['neon-blue']

  const isYouTube = current?.track?.source === 'youtube' && !!current?.track?.videoId
  const timerIsLow = trackTimeLeft < 10

  if (!player1 || !player2 || !track1 || !track2) return <Reconnecting />

  const currentSongVotes = serverSongVotes[currentTrackIndex] || { up: 0, down: 0, voterCount: 0, totalPlayers: 0, voters: [] }
  const votesRemaining = currentSongVotes.totalPlayers > 0
    ? currentSongVotes.totalPlayers - currentSongVotes.voterCount
    : null
  const currentSkipRequests = serverSkipRequests[currentTrackIndex] || { requestedCount: 0, totalPlayers: 0 }
  const skipRemaining = currentSkipRequests.totalPlayers > 0
    ? currentSkipRequests.totalPlayers - currentSkipRequests.requestedCount
    : null

  return (
    <div className={`relative min-h-svh flex flex-col overflow-x-hidden ${
      isSuddenDeath ? SUDDEN_DEATH_BG : 'bg-gradient-to-b from-[#050510] via-[#060614] to-[#050510]'
    }`}>
      {/* Gradient-based glow, not blur-filtered -- blur() cost scales heavily on
          mobile GPUs and this element size/radius combo was a real jank source. */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${phase === 'playing' ? 'opacity-100' : 'opacity-30'}`}
        style={{
          background: isSuddenDeath
            // Same technique, red instead of blue/purple, and pulled tighter so
            // the edges of the screen stay black.
            ? 'radial-gradient(50% 35% at 50% -4%, rgba(255,31,61,0.20), transparent 62%),' +
              'radial-gradient(38% 28% at 4% 100%, rgba(143,13,30,0.18), transparent 64%),' +
              'radial-gradient(38% 28% at 98% 104%, rgba(143,13,30,0.18), transparent 64%)'
            : 'radial-gradient(55% 40% at 50% -6%, rgba(0,128,255,0.14), transparent 60%),' +
              'radial-gradient(40% 32% at 6% 100%, rgba(139,47,232,0.10), transparent 62%),' +
              'radial-gradient(40% 32% at 96% 104%, rgba(0,128,255,0.10), transparent 62%)',
        }}
      />

      <div className={`absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-1000 ${phase === 'playing' ? 'opacity-100' : 'opacity-0'}`} />

      {/* Drifting orbs in this round's own accent -- the lounge's ambience,
          recolored per bracket round (blood red for a tiebreak, gold for the
          final). Replaces the floating music notes that used to sit here:
          both are ambient motion, and running them together just made the
          screen busy behind a playing video.

          Deliberately ABOVE the black scrim: the scrim's job is to sink the
          static backdrop so the video/art pops, but it was also taking 40%
          off the orbs for the entire time a track plays -- which is exactly
          when anyone is looking. Stage lights shouldn't dim with the room. */}
      <DriftingOrbs colors={orbColorsForRound({ roundLabel, isSuddenDeath })} />
      {isFinals && <FinalsGlow />}

      <AppNav right={
        isSuddenDeath ? (
          <SuddenDeathBadge round={suddenDeathRound} isFinal={isFinalSuddenDeath} />
        ) : isFinals ? (
          <FinalsBadge />
        ) : (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
            {roundLabel || `Round ${round}`}
          </span>
        )
      } />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4">
        {phase === 'finished' && tiebreakInfo ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">⚔️</span>
            <h2 className="text-2xl md:text-3xl font-black text-blood tracking-tight">
              Dead even.
            </h2>
            <p className="text-text-secondary max-w-sm">
              {typeof tiebreakInfo.tiedFire === 'number'
                ? `Both tracks pulled ${tiebreakInfo.tiedFire} 🔥. `
                : 'The room couldn’t split them. '}
              {tiebreakInfo.isFinal
                ? 'Last chance — new tracks, one more vote.'
                : 'Sudden death: new tracks, new vote.'}
            </p>
          </div>
        ) : phase === 'finished' && advanceInfo ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-5xl animate-bounce">🏆</span>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-green">{advanceInfo.winnerName} advances!</h2>
            {advanceInfo.np1 && advanceInfo.np2 && (
              <p className="text-text-secondary">
                {advanceInfo.nextLabel ? `${advanceInfo.nextLabel}: ` : 'Next up: '}
                <span className="text-text-primary font-semibold">{advanceInfo.np1.name}</span>
                {' vs '}
                <span className="text-text-primary font-semibold">{advanceInfo.np2.name}</span>
              </p>
            )}
          </div>
        ) : phase === 'finished' ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl animate-pulse">⚡</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Tallying votes...</h2>
          </div>
        ) : phase === 'intro' && introKind === 'round' ? (
          <RoundIntro
            roundLabel={roundLabel}
            isSuddenDeath={isSuddenDeath}
            suddenDeathRound={suddenDeathRound}
            isFinalSuddenDeath={isFinalSuddenDeath}
            player1={player1}
            player2={player2}
            bracket={bracket}
            you={user?.username}
          />
        ) : (
          <>
            <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${phase === 'intro' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <Avatar
                username={current?.player?.name}
                avatarId={avatars[current?.player?.name]?.avatarId}
                avatarColor={avatars[current?.player?.name]?.avatarColor}
                size={40}
              />
              <div>
                <p className={`${textClass} font-bold text-sm`}>{current?.player?.name}&apos;s pick</p>
                <p className="text-text-muted text-xs">Track {currentTrackIndex + 1} of {tracks.length}</p>
              </div>
            </div>

            <div className={`transition-all duration-700 w-full max-w-2xl mx-auto ${phase === 'intro' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {songStopped ? (
                <div className="w-full bg-card/60 border border-text-muted/15 rounded-2xl p-8 text-center mb-6">
                  <span className="text-3xl block mb-2">⏱️</span>
                  <p className={`${textClass} font-bold text-lg`}>Time&apos;s Up!</p>
                  <p className="text-text-primary font-semibold mt-2">{current?.track?.name}</p>
                  <p className="text-text-secondary text-sm">{current?.track?.artist}</p>
                </div>
              ) : phase === 'playing' && isYouTube ? (
                <div className={`rounded-2xl overflow-hidden ${glowClass} mx-auto mb-6`}>
                  <iframe
                    // Two things keep YouTube's "this video is playing on another
                    // screen" guard from firing when we swap songs:
                    //   1. key={videoId} forces a brand-new iframe per video instead
                    //      of React reusing the node and mutating `src` in place.
                    //   2. NO enablejsapi=1. The app never drives the player through
                    //      the JS API, and enablejsapi opts the embed into YouTube's
                    //      remote-control ("connected devices") machinery, which
                    //      reads/writes yt-remote-* in localStorage. Stale entries
                    //      left by the first song's embed make the second song's
                    //      embed believe it's already playing on another screen and
                    //      refuse to start -- the exact bug players hit. Dropping the
                    //      flag and using the cookieless host removes that shared
                    //      cross-embed state entirely.
                    key={current.track.videoId}
                    src={`https://www.youtube-nocookie.com/embed/${current.track.videoId}?autoplay=1&playsinline=1&rel=0&end=300`}
                    title={current.track.name}
                    className="w-full aspect-video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : phase === 'playing' && isSpotify && spotifyPlaybackStatus !== 'ready' ? (
                <div className={`rounded-2xl overflow-hidden ${glowClass} mx-auto mb-6`}>
                  <SpotifyEmbed key={current.track.id} trackId={current.track.id} />
                </div>
              ) : phase === 'playing' && isSpotify ? (
                // SDK path: the player is headless, so unlike the iframe embed it
                // renders NOTHING on its own -- the album art has to come from us
                // or the screen is just text while a full track plays.
                <div className="flex justify-center mb-6">
                  {current?.track?.albumArtUrl ? (
                    <img
                      src={current.track.albumArtUrl}
                      alt={`${current.track.name} album art`}
                      className={`w-64 h-64 md:w-72 md:h-72 rounded-2xl object-cover ${glowClass}`}
                    />
                  ) : (
                    <div className={`w-64 h-64 md:w-72 md:h-72 rounded-2xl bg-card flex items-center justify-center ${glowClass}`}>
                      <span className="text-5xl">🎵</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* The iframe embed shows its own title/art, so this stays hidden
                  for it -- but the SDK path is headless and has nothing else on
                  screen, so it needs this block same as YouTube does. */}
              {(!isSpotify || spotifyPlaybackStatus === 'ready') && (
                <div className="text-center mb-8">
                  <h2 className={`${textClass} font-bold text-2xl md:text-3xl mb-1`}>{current?.track?.name}</h2>
                  <p className="text-text-secondary text-lg">{current?.track?.artist}</p>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    {isYouTube ? (
                      // Was a hardcoded "5:00 limit" (the embed's own end=300),
                      // but the round now actually advances at the host's Song
                      // Play Time -- so that's the number that matters here.
                      <p className="text-text-muted text-sm">{formatTime(trackSeconds)} limit</p>
                    ) : (
                      <>
                        <p className="text-text-muted text-sm">{current?.track?.album}</p>
                        {current?.track?.durationMs && (
                          <>
                            <span className="text-text-muted/30">·</span>
                            <span className="text-text-muted text-sm">{formatDuration(current.track.durationMs)}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {phase === 'playing' && (
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                {/* Track timer */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isSuddenDeath ? 'bg-blood' : isFinals ? 'bg-neon-yellow' : timerIsLow ? 'bg-neon-pink' : 'bg-neon-blue'
                      }`}
                      style={{ width: `${(trackTimeLeft / trackSeconds) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono font-bold tabular-nums w-9 text-right ${
                    isSuddenDeath ? 'text-blood' : isFinals ? 'text-neon-yellow' : timerIsLow ? 'text-neon-pink' : 'text-text-muted'
                  }`}>
                    {formatTime(trackTimeLeft)}
                  </span>
                </div>

                {/* Vote buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleVote('up')}
                    disabled={!!vote}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 ${
                      vote === 'up'
                        ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
                        : vote
                          ? 'border-text-muted/15 text-text-muted/40 cursor-not-allowed'
                          : 'border-neon-green/30 text-neon-green hover:bg-neon-green/10 cursor-pointer'
                    }`}
                  >
                    <span className="text-lg">🔥</span>
                  </button>
                  <button
                    onClick={() => handleVote('down')}
                    disabled={!!vote}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 ${
                      vote === 'down'
                        ? 'bg-neon-pink/20 border-neon-pink/50 text-neon-pink'
                        : vote
                          ? 'border-text-muted/15 text-text-muted/40 cursor-not-allowed'
                          : 'border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 cursor-pointer'
                    }`}
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>

                {/* Voter progress */}
                {vote && votesRemaining !== null && (
                  <div className="flex flex-col items-center gap-2.5">
                    <p className="text-text-muted text-xs text-center">
                      {votesRemaining > 0
                        ? `Waiting for ${votesRemaining} more vote${votesRemaining !== 1 ? 's' : ''}...`
                        : 'All votes in!'}
                    </p>
                    {votesRemaining === 0 && !songStopped && (
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={handleSkip}
                          disabled={skipRequested}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {skipRequested ? 'Skip requested' : 'Skip to Next'}
                          <span>⏭</span>
                        </button>
                        {skipRequested && (
                          <p className="text-text-muted text-[11px] text-center">
                            {skipRemaining > 0
                              ? `Waiting for ${skipRemaining} more to agree...`
                              : 'Everyone agreed — skipping!'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <div className="relative z-10 border-t border-text-muted/10 px-6 py-4">
        <div className="flex items-center justify-center gap-5">
          {allPlayers.map((p, i) => (
            <AudienceMember
              key={i}
              player={p}
              isCurrentPerformer={p.name === current?.player?.name}
              hasVoted={currentSongVotes.voters.includes(p.name)}
              avatars={avatars}
            />
          ))}
        </div>
      </div>

      <Footer className="py-4" />
    </div>
  )
}

export default Stage
