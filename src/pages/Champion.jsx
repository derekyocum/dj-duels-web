import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import AppBackground from '../components/AppBackground'
import AppNav from '../components/AppNav'
import BracketPanel from '../components/BracketPanel'
import Confetti from '../components/Confetti'
import Footer from '../components/Footer'
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

const FIREWORK_COLORS = ['#0080FF', '#8B2FE8', '#FF2D95', '#39FF14', '#FFE01F']

function Fireworks() {
  const particles = useMemo(() =>
    [0, 0.6, 1.2].flatMap((waveDelay, w) =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * 360 + w * 13
        const dist = 55 + (i % 4) * 20
        const rad = (angle * Math.PI) / 180
        return {
          id: `${w}-${i}`,
          tx: Math.cos(rad) * dist,
          ty: Math.sin(rad) * dist,
          color: FIREWORK_COLORS[(i + w * 2) % FIREWORK_COLORS.length],
          delay: waveDelay + i * 0.005,
          size: 3 + (i % 3),
        }
      })
    )
  , [])

  return (
    <>
      <style>{`
        @keyframes fw-particle {
          0%   { opacity: 1; transform: translate(-50%, -50%); }
          75%  { opacity: 0.9; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--fw-tx)), calc(-50% + var(--fw-ty))); }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
        {particles.map(({ id, tx, ty, color, delay, size }) => (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}90`,
              animation: `fw-particle 1.0s ease-out ${delay}s both`,
              '--fw-tx': `${tx}px`,
              '--fw-ty': `${ty}px`,
            }}
          />
        ))}
      </div>
    </>
  )
}

function formatTime(s) {
  const clamped = Math.max(0, s)
  return `${Math.floor(clamped / 60)}:${String(clamped % 60).padStart(2, '0')}`
}

// Small avatar chip for the participants row. The two battlers carry their
// revealed vote tallies (votes stay anonymous during the round -- this page is
// now the only reveal point, since the interstitial RoundWinner page is gone).
function ParticipantChip({ player, votes, isChampion }) {
  const bg = COLOR_BG[player.color] || COLOR_BG['neon-blue']
  const border = COLOR_BORDER[player.color] || COLOR_BORDER['neon-blue']
  const text = COLOR_TEXT[player.color] || COLOR_TEXT['neon-blue']

  return (
    <div className={`flex flex-col items-center gap-1.5 ${isChampion ? '' : 'opacity-70'}`}>
      <div className={`relative w-12 h-12 rounded-full ${bg} border-2 ${border} flex items-center justify-center`}>
        <span className={`${text} font-bold text-lg`}>{player.name.charAt(0)}</span>
        {isChampion && <span className="absolute -top-2.5 text-sm">👑</span>}
      </div>
      <span className="text-text-secondary text-xs font-medium truncate max-w-[72px]">{player.name}</span>
      {votes && (
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-neon-green">🔥 {votes.up ?? 0}</span>
          <span className="text-neon-pink">🗑️ {votes.down ?? 0}</span>
        </div>
      )}
    </div>
  )
}

function Champion() {
  const { duelId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    champion, trackHistory = {}, allPlayers = [],
    loser, winnerVotes, loserVotes, winnerTrophies, bracket,
  } = location.state ?? {}
  // -1 means the server couldn't record the win (DynamoDB blip); treat as unknown.
  const showTrophies = typeof winnerTrophies === 'number' && winnerTrophies >= 0
  const tracks = trackHistory[champion?.name] || []
  // Server is the source of truth for who's host -- same pattern Lobby uses.
  const isHost = allPlayers.find((p) => p.name === user?.username)?.isHost ?? false

  // Tallies keyed by name so the participants row can attach them to the two
  // battlers; spectators simply have none. Optional on purpose -- a resync or
  // an old-shape navigation without tallies still renders everything else.
  const votesByName = {}
  if (champion?.name && winnerVotes) votesByName[champion.name] = winnerVotes
  if (loser?.name && loserVotes) votesByName[loser.name] = loserVotes

  const [carouselIndex, setCarouselIndex] = useState(0)
  const [closeAt, setCloseAt] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [showFireworks, setShowFireworks] = useState(true)
  // 'idle' | 'waiting' (non-host, clicked, server is waiting on the host) |
  // 'starting' (host, clicked -- REMATCH should arrive almost immediately)
  const [playAgainState, setPlayAgainState] = useState('idle')
  const [optedInCount, setOptedInCount] = useState(0)
  const gameSentRef = useRef(false)
  const autoScrollRef = useRef(null)

  const color = champion?.color || 'neon-blue'
  const bg = COLOR_BG[color] || COLOR_BG['neon-blue']
  const border = COLOR_BORDER[color] || COLOR_BORDER['neon-blue']
  const text = COLOR_TEXT[color] || COLOR_TEXT['neon-blue']

  useEffect(() => {
    if (tracks.length <= 1) return
    autoScrollRef.current = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % tracks.length)
    }, 4000)
    return () => clearInterval(autoScrollRef.current)
  }, [tracks.length])

  // Fireworks run for ~2.4 s (3 waves × ~0.6 s gap + 1 s duration)
  useEffect(() => {
    const id = setTimeout(() => setShowFireworks(false), 2500)
    return () => clearTimeout(id)
  }, [])

  const handleGameEvent = useCallback((event) => {
    if (event.type === 'SESSION_CLOSING') {
      setCloseAt(event.payload.closeAt)
    } else if (event.type === 'SESSION_CLOSED' || event.type === 'SESSION_EXPIRED') {
      navigate('/')
    } else if (event.type === 'PLAY_AGAIN_UPDATE') {
      setOptedInCount(event.payload.optedIn?.length ?? 0)
    } else if (event.type === 'REMATCH') {
      // Play Again is per-player opt-in now -- the roster is only whoever
      // had clicked by the time the host launched it, so someone who never
      // clicked (or was too slow) isn't part of the new lobby and shouldn't
      // follow everyone else in.
      const iAmIncluded = event.payload.players?.some((p) => p.name === user?.username)
      if (!iAmIncluded) {
        navigate('/')
        return
      }
      // No capacity to carry -- the rematch lobby is open like any other, and
      // the host's rules come down with the next PLAYER_JOINED.
      navigate(`/lobby/${duelId}`)
    }
  }, [navigate, duelId, user?.username])

  const { send, isConnected } = useDuelSocket()
  useDuelEvents(handleGameEvent)

  const handlePlayAgain = useCallback(() => {
    send('game/play-again', { duelId })
    setPlayAgainState(isHost ? 'starting' : 'waiting')
  }, [send, duelId, isHost])

  useEffect(() => {
    if (!champion) navigate('/', { replace: true })
  }, [champion, navigate])

  useEffect(() => {
    if (isConnected && !gameSentRef.current) {
      gameSentRef.current = true
      send('game/end', { duelId })
    }
  }, [isConnected, send, duelId])

  useEffect(() => {
    if (!closeAt) return
    const tick = () => setSecondsLeft(Math.ceil((closeAt - Date.now()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [closeAt])

  if (!champion) return null

  return (
    <div className="relative min-h-svh flex flex-col overflow-x-hidden bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />
      <Confetti />

      <AppNav />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Title + fireworks container */}
        <div className="relative flex flex-col items-center mb-2">
          {showFireworks && <Fireworks />}
          <span className="text-5xl mb-4">👑</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-center">
            <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              Give {champion?.name} aux!
            </span>
          </h1>
        </div>

        <div className="mt-8 mb-6">
          <div className={`w-28 h-28 rounded-full ${bg} border-4 ${border} shadow-[0_0_60px_rgba(0,128,255,0.3)] flex items-center justify-center mx-auto`}>
            <span className={`${text} font-bold text-5xl`}>{champion?.name?.charAt(0)}</span>
          </div>
          <p className="text-text-primary font-bold text-2xl text-center mt-4">{champion?.name}</p>
          {showTrophies && (
            <div className="flex justify-center mt-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow font-bold text-sm">
                🏆 {winnerTrophies} {winnerTrophies === 1 ? 'trophy' : 'trophies'}
              </span>
            </div>
          )}
        </div>

        {/* Every track the champion locked in across the battle, one per slide */}
        {tracks.length > 0 && (
          <div className="w-full max-w-md mt-4">
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-medium text-center mb-3">
              {champion?.name}&apos;s winning set
            </p>
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {tracks.map((track, i) => (
                  <div key={i} className="w-full shrink-0 px-6">
                    <div className="flex flex-col items-center gap-3 py-2 text-center">
                      {track.albumArtUrl ? (
                        <img
                          src={track.albumArtUrl}
                          alt={track.album || track.name}
                          className="w-32 h-32 rounded-xl object-cover shadow-[0_8px_30px_-8px_rgba(0,0,0,0.8)]"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-xl bg-card flex items-center justify-center">
                          <span className="text-3xl">🎵</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-text-primary font-semibold text-sm truncate max-w-[260px]">{track.name}</p>
                        <p className="text-text-muted text-xs truncate max-w-[260px]">{track.artist}</p>
                        <span className="text-text-muted/40 text-xs">Round {i + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {tracks.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {tracks.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === carouselIndex ? 'bg-text-muted/40 w-5' : 'bg-text-muted/15 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Play Again is per-player opt-in now: clicking just registers
                interest -- only the host's click actually launches the
                rematch (with whoever's opted in by then), same authority
                lobby/start already has. */}
            <button
              onClick={handlePlayAgain}
              disabled={playAgainState !== 'idle'}
              className="px-8 py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_30px_-6px_rgba(0,128,255,0.5)] hover:shadow-[0_0_40px_-4px_rgba(0,128,255,0.7)] transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {playAgainState === 'waiting' ? 'Waiting for Host...' : playAgainState === 'starting' ? 'Starting...' : 'Play Again'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 text-base font-bold rounded-full border-2 border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 transition-all duration-300 cursor-pointer"
            >
              Back to Home
            </button>
          </div>
          {optedInCount > 0 && playAgainState === 'waiting' && (
            <p className="text-text-muted text-xs">
              {optedInCount} {optedInCount === 1 ? 'player has' : 'players have'} opted in so far
            </p>
          )}
        </div>

        {/* Participants row -- everyone from the lobby; battlers show their tallies */}
        {allPlayers.length > 0 && (
          <div className="mt-10 pt-6 border-t border-text-muted/10 w-full max-w-md">
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-medium text-center mb-4">
              Tonight&apos;s lineup
            </p>
            <div className="flex flex-wrap items-start justify-center gap-6">
              {allPlayers.map((p, i) => (
                <ParticipantChip
                  key={i}
                  player={p}
                  votes={votesByName[p.name]}
                  isChampion={p.name === champion?.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tournament recap -- only meaningful once there was more than one match */}
        {Array.isArray(bracket) && bracket.length > 1 && (
          <div className="mt-8 pt-6 border-t border-text-muted/10 w-full max-w-3xl">
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-medium text-center mb-4">
              How it played out
            </p>
            <BracketPanel bracket={bracket} you={champion?.name} />
          </div>
        )}
      </main>

      <Footer>
        {closeAt && secondsLeft !== null && (
          <div className={`flex items-center justify-center gap-3 mb-3 transition-opacity duration-500 ${secondsLeft < 30 ? 'opacity-50' : 'opacity-20'}`}>
            <span className="text-[10px] text-text-muted">lobby closes in</span>
            <div className="w-20 h-px bg-text-muted/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-text-muted/40 transition-all duration-1000"
                style={{ width: `${Math.max(0, (secondsLeft / 180) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-text-muted tabular-nums">
              {formatTime(secondsLeft)}
            </span>
          </div>
        )}
      </Footer>
    </div>
  )
}

export default Champion
