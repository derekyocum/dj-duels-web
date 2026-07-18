import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import AppNav from '../components/AppNav'
import Reconnecting from '../components/Reconnecting'
import { useAuth } from '../context/AuthContext'
import { useDuelSocket, useDuelEvents } from '../context/DuelSocketContext'

const COLOR_BG = {
  'neon-blue': 'bg-neon-blue/20',
  'neon-pink': 'bg-neon-pink/20',
  'neon-purple': 'bg-neon-purple/20',
  'neon-green': 'bg-neon-green/20',
  'neon-yellow': 'bg-neon-yellow/20',
}

const COLOR_BORDER = {
  'neon-blue': 'border-neon-blue/50',
  'neon-pink': 'border-neon-pink/50',
  'neon-purple': 'border-neon-purple/50',
  'neon-green': 'border-neon-green/50',
  'neon-yellow': 'border-neon-yellow/50',
}

const COLOR_TEXT = {
  'neon-blue': 'text-neon-blue',
  'neon-pink': 'text-neon-pink',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
  'neon-yellow': 'text-neon-yellow',
}

const COLOR_GLOW = {
  'neon-blue': 'shadow-[0_0_40px_rgba(0,212,255,0.25)]',
  'neon-pink': 'shadow-[0_0_40px_rgba(255,45,149,0.25)]',
  'neon-purple': 'shadow-[0_0_40px_rgba(179,71,255,0.25)]',
  'neon-green': 'shadow-[0_0_40px_rgba(57,255,20,0.25)]',
  'neon-yellow': 'shadow-[0_0_40px_rgba(255,240,31,0.25)]',
}

const TRACK_SECONDS = 90

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function AudienceMember({ player, isCurrentPerformer, hasVoted }) {
  const bg = COLOR_BG[player.color] || COLOR_BG['neon-blue']
  const border = COLOR_BORDER[player.color] || COLOR_BORDER['neon-blue']
  const text = COLOR_TEXT[player.color] || COLOR_TEXT['neon-blue']

  return (
    <div className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isCurrentPerformer ? 'scale-110' : 'opacity-60'}`}>
      <div className={`relative w-10 h-10 rounded-full ${bg} border-2 ${border} flex items-center justify-center ${isCurrentPerformer ? 'ring-2 ring-neon-blue/40' : ''}`}>
        <span className={`${text} font-bold text-sm`}>{player.name.charAt(0)}</span>
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
    roundLabel,
  } = location.state ?? {}
  const round = parseInt(roundNum, 10)

  const [phase, setPhase] = useState('intro')
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => location.state?.currentSongIndex ?? 0)
  const [vote, setVote] = useState(null)
  const [trackTimeLeft, setTrackTimeLeft] = useState(TRACK_SECONDS)
  const [songStopped, setSongStopped] = useState(false)
  const [skipRequested, setSkipRequested] = useState(false)
  // songIndex -> { up, down, voterCount, totalPlayers, voters[] }
  const [serverSongVotes, setServerSongVotes] = useState({})
  // songIndex -> { requestedCount, totalPlayers } -- skip needs everyone's agreement
  const [serverSkipRequests, setServerSkipRequests] = useState({})
  // Server-authoritative end timestamp for the current song; syncs all clients
  const [songEndsAt, setSongEndsAt] = useState(location.state?.songEndsAt ?? null)

  const tracks = [
    { track: track1, player: player1, key: 'player1' },
    { track: track2, player: player2, key: 'player2' },
  ]
  const current = tracks[currentTrackIndex]

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
        setTrackTimeLeft(TRACK_SECONDS)
        setSongStopped(false)
        setSkipRequested(false)
        setPhase('intro')
        setTimeout(() => setPhase('playing'), 1500)
        break
      }
      case 'ROUND_COMPLETE': {
        const { winnerName, loserName, winnerVotes, loserVotes } = event.payload
        setPhase('finished')
        const winner = winnerName === player1?.name ? player1 : player2
        const loser = loserName === player1?.name ? player1 : player2
        const winnerTrack = winner === player1 ? track1 : track2
        const newTrackHistory = { ...trackHistory }
        if (!newTrackHistory[winner?.name]) newTrackHistory[winner?.name] = []
        newTrackHistory[winner?.name] = [...newTrackHistory[winner?.name], winnerTrack]
        setTimeout(() => {
          navigate(`/duel/${duelId}/round/${roundNum}/winner`, {
            state: {
              winner, loser,
              winnerVotes: { up: winnerVotes.up, down: winnerVotes.down },
              loserVotes: { up: loserVotes.up, down: loserVotes.down },
              roundLabel: roundLabel || 'Round 1',
              nextAction: 'champion',
              allPlayers, trackHistory: newTrackHistory,
            },
          })
        }, 2000)
        break
      }
      default:
        break
    }
  }, [player1, player2, track1, track2, trackHistory, roundLabel, duelId, roundNum, allPlayers, navigate])

  const { send } = useDuelSocket()
  useDuelEvents(handleGameEvent)

  // Intro → playing transition
  useEffect(() => {
    const timer = setTimeout(() => setPhase('playing'), 1500)
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
  const borderClass = COLOR_BORDER[color] || COLOR_BORDER['neon-blue']
  const glowClass = COLOR_GLOW[color] || COLOR_GLOW['neon-blue']
  const bgClass = COLOR_BG[color] || COLOR_BG['neon-blue']

  const isSpotify = current?.track?.source === 'spotify' && !!current?.track?.id
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
    <div className="relative min-h-svh flex flex-col overflow-x-hidden bg-gradient-to-b from-[#050510] via-[#060614] to-[#050510]">
      <MusicNotes />

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${phase === 'playing' ? 'opacity-100' : 'opacity-30'}`}>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/6 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/5 rounded-full blur-[120px]" />
      </div>

      <div className={`absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-1000 ${phase === 'playing' ? 'opacity-100' : 'opacity-0'}`} />

      <AppNav right={
        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
          {roundLabel || `Round ${round}`}
        </span>
      } />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4">
        {phase === 'finished' ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl animate-pulse">⚡</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Tallying votes...</h2>
          </div>
        ) : (
          <>
            <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${phase === 'intro' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className={`w-10 h-10 rounded-full ${bgClass} border-2 ${borderClass} flex items-center justify-center`}>
                <span className={`${textClass} font-bold text-sm`}>{current?.player?.name?.charAt(0)}</span>
              </div>
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
                    src={`https://www.youtube.com/embed/${current.track.videoId}?autoplay=1&enablejsapi=1&end=300`}
                    title={current.track.name}
                    className="w-full aspect-video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : phase === 'playing' && isSpotify ? (
                <div className={`rounded-2xl overflow-hidden ${glowClass} mx-auto mb-6`}>
                  <iframe
                    src={`https://open.spotify.com/embed/track/${current.track.id}?utm_source=generator&theme=0&autoplay=1`}
                    title={current.track.name}
                    className="w-full h-[352px]"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                </div>
              ) : null}

              {!isSpotify && (
                <div className="text-center mb-8">
                  <h2 className={`${textClass} font-bold text-2xl md:text-3xl mb-1`}>{current?.track?.name}</h2>
                  <p className="text-text-secondary text-lg">{current?.track?.artist}</p>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    {isYouTube ? (
                      <p className="text-text-muted text-sm">5:00 limit</p>
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
                      className={`h-full rounded-full transition-all duration-1000 ${timerIsLow ? 'bg-neon-pink' : 'bg-neon-blue'}`}
                      style={{ width: `${(trackTimeLeft / TRACK_SECONDS) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono font-bold tabular-nums w-9 text-right ${timerIsLow ? 'text-neon-pink' : 'text-text-muted'}`}>
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
                    <span className="font-semibold text-sm">{currentSongVotes.up}</span>
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
                    <span className="font-semibold text-sm">{currentSongVotes.down}</span>
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
            />
          ))}
        </div>
      </div>

      <footer className="relative z-10 text-center py-4 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>
    </div>
  )
}

export default Stage
