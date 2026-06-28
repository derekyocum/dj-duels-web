import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'

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
  'neon-blue': 'shadow-[0_0_50px_rgba(0,212,255,0.3)]',
  'neon-pink': 'shadow-[0_0_50px_rgba(255,45,149,0.3)]',
  'neon-purple': 'shadow-[0_0_50px_rgba(179,71,255,0.3)]',
  'neon-green': 'shadow-[0_0_50px_rgba(57,255,20,0.3)]',
  'neon-yellow': 'shadow-[0_0_50px_rgba(255,240,31,0.3)]',
}

function PlayerResult({ player, fireCount, trashCount, isWinner }) {
  const bg = COLOR_BG[player.color] || COLOR_BG['neon-blue']
  const border = COLOR_BORDER[player.color] || COLOR_BORDER['neon-blue']
  const text = COLOR_TEXT[player.color] || COLOR_TEXT['neon-blue']
  const glow = COLOR_GLOW[player.color] || COLOR_GLOW['neon-blue']

  return (
    <div className={`flex flex-col items-center gap-3 transition-all duration-700 ${isWinner ? 'scale-110' : 'opacity-50 scale-90'}`}>
      {isWinner && <span className="text-3xl">👑</span>}
      <div className={`w-20 h-20 rounded-full ${bg} border-2 ${border} ${isWinner ? glow : ''} flex items-center justify-center`}>
        <span className={`${text} font-bold text-3xl`}>{player.name.charAt(0)}</span>
      </div>
      <span className={`font-bold text-lg ${isWinner ? 'text-text-primary' : 'text-text-muted'}`}>{player.name}</span>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-neon-green">🔥 {fireCount}</span>
        <span className="flex items-center gap-1 text-neon-pink">🗑️ {trashCount}</span>
      </div>
    </div>
  )
}

function RoundWinner() {
  const { duelId, roundNum } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    winner, loser,
    winnerVotes, loserVotes,
    roundLabel,
    bracket, trackHistory, allPlayers,
  } = location.state || {}

  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleNextRound = () => {
    const { nextAction, nextState } = location.state || {}

    if (nextAction === 'champion') {
      navigate(`/duel/${duelId}/champion`, {
        state: { champion: winner, trackHistory, allPlayers },
      })
    } else if (nextAction === 'auto-semifinal') {
      navigate(`/duel/${duelId}/round/${nextState.roundNum}/winner`, {
        state: nextState,
      })
    } else if (nextAction === 'faceoff') {
      navigate(`/duel/${duelId}/round/${nextState.roundNum}`, {
        state: nextState,
      })
    }
  }

  return (
    <div className="relative min-h-svh flex flex-col overflow-x-hidden bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
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
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20 mb-6">
          {roundLabel || `Round ${roundNum}`}
        </span>

        <h2 className={`text-2xl md:text-3xl font-bold text-text-primary mb-10 transition-opacity duration-700 ${revealed ? 'opacity-0 h-0' : 'opacity-100'}`}>
          And the winner is...
        </h2>

        <div className={`flex items-center gap-8 sm:gap-16 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {winner && (
            <PlayerResult
              player={winner}
              fireCount={winnerVotes?.up || 0}
              trashCount={winnerVotes?.down || 0}
              isWinner={true}
            />
          )}

          <span className="text-text-muted/30 text-2xl font-black">VS</span>

          {loser && (
            <PlayerResult
              player={loser}
              fireCount={loserVotes?.up || 0}
              trashCount={loserVotes?.down || 0}
              isWinner={false}
            />
          )}
        </div>

        {revealed && (
          <button
            onClick={handleNextRound}
            className="mt-12 px-8 py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all duration-300 cursor-pointer"
          >
            {location.state?.nextAction === 'champion' ? 'See Champion' : 'Next Round'}
          </button>
        )}
      </main>

      <footer className="relative z-10 text-center py-6 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>
    </div>
  )
}

export default RoundWinner
