import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import AppNav from '../components/AppNav'
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

const FIREWORK_COLORS = ['#00D4FF', '#B347FF', '#FF2D95', '#39FF14', '#FFE01F']

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

function Champion() {
  const { duelId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { champion, trackHistory = {} } = location.state ?? {}
  const tracks = trackHistory[champion?.name] || []

  const [carouselIndex, setCarouselIndex] = useState(0)
  const [closeAt, setCloseAt] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [showFireworks, setShowFireworks] = useState(true)
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
    }
  }, [navigate])

  const { send, isConnected } = useDuelSocket()
  useDuelEvents(handleGameEvent)

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
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

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
          <div className={`w-28 h-28 rounded-full ${bg} border-4 ${border} shadow-[0_0_60px_rgba(0,212,255,0.3)] flex items-center justify-center mx-auto`}>
            <span className={`${text} font-bold text-5xl`}>{champion?.name?.charAt(0)}</span>
          </div>
          <p className="text-text-primary font-bold text-2xl text-center mt-4">{champion?.name}</p>
        </div>

        {tracks.length > 0 && (
          <div className="w-full max-w-xl mt-4">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {tracks.map((track, i) => (
                  <div key={i} className="w-full shrink-0 px-6">
                    <div className="flex items-center gap-4 py-3">
                      {track.albumArtUrl && (
                        <img
                          src={track.albumArtUrl}
                          alt={track.album || track.name}
                          className="w-16 h-16 rounded-lg object-cover opacity-70 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-text-primary/70 font-semibold text-sm truncate">{track.name}</p>
                        <p className="text-text-muted text-xs truncate">{track.artist}</p>
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

        <button
          onClick={() => navigate('/')}
          className="mt-10 px-8 py-3 text-base font-bold rounded-full border-2 border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 transition-all duration-300 cursor-pointer"
        >
          Back to Home
        </button>
      </main>

      <footer className="relative z-10 text-center py-6 text-text-muted text-xs">
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
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>
    </div>
  )
}

export default Champion
