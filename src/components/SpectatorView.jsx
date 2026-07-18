import CountdownTimer from './CountdownTimer'

const COLOR_GLOW = {
  'neon-blue': 'shadow-[0_0_25px_rgba(0,128,255,0.3)]',
  'neon-pink': 'shadow-[0_0_25px_rgba(255,45,149,0.3)]',
  'neon-purple': 'shadow-[0_0_25px_rgba(139,47,232,0.3)]',
  'neon-green': 'shadow-[0_0_25px_rgba(57,255,20,0.3)]',
  'neon-yellow': 'shadow-[0_0_25px_rgba(255,240,31,0.3)]',
}

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

function PlayerAvatar({ player }) {
  const glow = COLOR_GLOW[player.color] || COLOR_GLOW['neon-blue']
  const bg = COLOR_BG[player.color] || COLOR_BG['neon-blue']
  const border = COLOR_BORDER[player.color] || COLOR_BORDER['neon-blue']
  const text = COLOR_TEXT[player.color] || COLOR_TEXT['neon-blue']

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-20 h-20 rounded-full ${bg} border-2 ${border} ${glow} flex items-center justify-center transition-all duration-300`}>
        <span className={`${text} font-bold text-3xl`}>
          {player.name.charAt(0)}
        </span>
      </div>
      <span className="text-text-primary font-semibold text-lg">{player.name}</span>
    </div>
  )
}

function SpectatorView({ player1, player2, timeLeft, totalTime = 90, roundNum }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20 mb-8">
        Round {roundNum}
      </span>

      <div className="flex items-center gap-6 sm:gap-10 mb-10">
        <PlayerAvatar player={player1} />

        <div className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black text-text-muted/60 tracking-tighter">VS</span>
        </div>

        <PlayerAvatar player={player2} />
      </div>

      <div className="mb-8">
        <CountdownTimer timeLeft={timeLeft} totalTime={totalTime} />
      </div>

      <div className="flex items-center gap-2 text-text-secondary">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
        <span className="text-sm">Selecting their tracks...</span>
      </div>
    </div>
  )
}

export default SpectatorView
