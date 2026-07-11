import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import SongSelection from '../components/SongSelection'
import SpectatorView from '../components/SpectatorView'
import AppNav from '../components/AppNav'
import { useAuth } from '../context/AuthContext'
import { useGameSocket } from '../hooks/useGameSocket'

function Faceoff() {
  const { duelId, roundNum } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const battler1 = location.state?.player1
  const battler2 = location.state?.player2
  const settings = location.state?.settings || {}
  const totalTime = settings.timeLimit || 90
  const round = parseInt(roundNum, 10)

  const opponent = user?.username === battler2?.name ? battler1 : battler2

  const faceoffEndsAt = location.state?.faceoffEndsAt

  const [viewMode, setViewMode] = useState('battler')
  const [timeLeft, setTimeLeft] = useState(() =>
    faceoffEndsAt ? Math.max(0, Math.round((faceoffEndsAt - Date.now()) / 1000)) : totalTime
  )
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)

  // Recalculate from server timestamp every second so all clients stay in lockstep
  useEffect(() => {
    if (!faceoffEndsAt) return
    const tick = () => setTimeLeft(Math.max(0, Math.round((faceoffEndsAt - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [faceoffEndsAt])

  const handleGameEvent = useCallback((event) => {
    if (event.type === 'BOTH_LOCKED_IN') {
      const p = event.payload
      navigate(`/duel/${duelId}/round/${roundNum}/stage`, {
        state: {
          player1: p.player1,
          player2: p.player2,
          track1: p.track1,
          track2: p.track2,
          allPlayers: p.allPlayers,
          trackHistory: p.trackHistory,
          roundLabel: p.roundLabel,
          songEndsAt: p.song0EndsAt,
        },
      })
    } else if (event.type === 'SESSION_EXPIRED' || event.type === 'SESSION_CLOSED') {
      navigate('/')
    }
  }, [navigate, duelId, roundNum])

  const { send } = useGameSocket(duelId, handleGameEvent)

  useEffect(() => {
    if (!battler1 || !battler2) navigate('/', { replace: true })
  }, [battler1, battler2, navigate])

  const handleLockIn = useCallback((trackInfo) => {
    setWaitingForOpponent(true)
    send('round/lock-in', { duelId, username: user?.username, track: trackInfo })
  }, [send, duelId, user?.username])

  if (!battler1 || !battler2) return null

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

      <AppNav right={
        <button
          onClick={() => setViewMode((v) => v === 'battler' ? 'spectator' : 'battler')}
          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary hover:border-text-muted/50 transition-colors cursor-pointer"
        >
          {viewMode === 'battler' ? '👁 Spectator View' : '🎵 Battler View'}
        </button>
      } />

      {settings.title && (
        <div className="relative z-10 flex justify-center px-6 pb-2">
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-neon-purple/10 border border-neon-purple/25 rounded-2xl">
            <span className="text-base">🎵</span>
            <span className="text-text-muted text-xs">Theme:</span>
            <span className="text-text-primary font-semibold text-sm">{settings.title}</span>
            {settings.genre && settings.genre !== 'Any genre' && (
              <>
                <span className="text-text-muted/40">·</span>
                <span className="text-neon-purple text-xs">{settings.genre}</span>
              </>
            )}
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 flex flex-col">
        {waitingForOpponent ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="bg-card/60 border border-neon-blue/20 rounded-2xl p-8 max-w-sm w-full text-center">
              <span className="text-3xl mb-4 block">🔒</span>
              <h3 className="text-xl font-bold text-text-primary mb-2">Track Locked In!</h3>
              <p className="text-text-secondary text-sm mb-4">
                Waiting for <span className="text-text-primary font-semibold">{opponent.name}</span> to pick...
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        ) : viewMode === 'battler' ? (
          <SongSelection
            opponent={opponent}
            timeLeft={timeLeft}
            totalTime={totalTime}
            roundNum={round}
            onLockIn={handleLockIn}
          />
        ) : (
          <SpectatorView
            player1={battler1}
            player2={battler2}
            timeLeft={timeLeft}
            totalTime={totalTime}
            roundNum={round}
          />
        )}
      </main>

      <footer className="relative z-10 text-center py-6 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>
    </div>
  )
}

export default Faceoff
