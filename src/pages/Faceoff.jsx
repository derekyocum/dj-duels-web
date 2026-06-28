import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import SongSelection from '../components/SongSelection'
import SpectatorView from '../components/SpectatorView'
import { DEMO_PLAYERS, DEMO_TRACKS, buildBracket } from '../utils/demoData'

function Faceoff() {
  const { duelId, roundNum } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const players = location.state?.players || DEMO_PLAYERS
  const allPlayers = location.state?.allPlayers || players
  const settings = location.state?.settings || {}
  const totalTime = settings.timeLimit || 90
  const round = parseInt(roundNum, 10)
  const roundLabel = location.state?.roundLabel || `Semifinal ${round}`
  const isFinal = location.state?.isFinal || false

  const bracket = useMemo(() => location.state?.bracket || buildBracket(players), [location.state?.bracket, players])
  const trackHistory = useMemo(() => location.state?.trackHistory || {}, [location.state?.trackHistory])

  const battler1 = location.state?.player1 || players[0]
  const battler2 = location.state?.player2 || players[1]

  const [viewMode, setViewMode] = useState('battler')
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  const handleLockIn = useCallback((trackInfo) => {
    setWaitingForOpponent(true)

    const opponentTracks = DEMO_TRACKS[battler2.name]
    const trackIndex = isFinal ? 1 : 0
    const opponentTrack = opponentTracks?.[trackIndex] || opponentTracks?.[0] || {
      id: 'demo', name: 'Mystery Track', artist: 'Unknown',
      album: 'Unknown', albumArtUrl: null, source: 'spotify',
    }

    setTimeout(() => {
      navigate(`/duel/${duelId}/round/${roundNum}/stage`, {
        state: {
          player1: battler1,
          player2: battler2,
          track1: trackInfo,
          track2: opponentTrack,
          allPlayers,
          bracket,
          trackHistory,
          roundLabel,
          isFinal,
        },
      })
    }, 2500)
  }, [navigate, duelId, roundNum, battler1, battler2, allPlayers, bracket, trackHistory, roundLabel, isFinal])

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>

        <button
          onClick={() => setViewMode((v) => v === 'battler' ? 'spectator' : 'battler')}
          className="px-3 py-1.5 text-xs font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary hover:border-text-muted/50 transition-colors cursor-pointer"
        >
          {viewMode === 'battler' ? '👁 Spectator View' : '🎵 Battler View'}
        </button>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col">
        {waitingForOpponent ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="bg-card/60 border border-neon-blue/20 rounded-2xl p-8 max-w-sm w-full text-center">
              <span className="text-3xl mb-4 block">🔒</span>
              <h3 className="text-xl font-bold text-text-primary mb-2">Track Locked In!</h3>
              <p className="text-text-secondary text-sm mb-4">
                Waiting for <span className="text-text-primary font-semibold">{battler2.name}</span> to pick...
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
            player={battler1}
            opponent={battler2}
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
