const COLOR_CLASSES = {
  'neon-blue': { bg: 'bg-neon-blue/20', border: 'border-neon-blue/50', text: 'text-neon-blue', cardBorder: 'border-neon-blue/30' },
  'neon-pink': { bg: 'bg-neon-pink/20', border: 'border-neon-pink/50', text: 'text-neon-pink', cardBorder: 'border-neon-pink/30' },
  'neon-purple': { bg: 'bg-neon-purple/20', border: 'border-neon-purple/50', text: 'text-neon-purple', cardBorder: 'border-neon-purple/30' },
  'neon-green': { bg: 'bg-neon-green/20', border: 'border-neon-green/50', text: 'text-neon-green', cardBorder: 'border-neon-green/30' },
  'neon-yellow': { bg: 'bg-neon-yellow/20', border: 'border-neon-yellow/50', text: 'text-neon-yellow', cardBorder: 'border-neon-yellow/30' },
}

function PlayerSlot({ player }) {
  if (!player) {
    return (
      <div className="w-36 bg-card/50 border border-dashed border-text-muted/20 rounded-xl p-5 flex flex-col items-center gap-3 animate-pulse-border">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-text-muted/30 flex items-center justify-center">
          <span className="text-text-muted text-xl">+</span>
        </div>
        <span className="text-text-muted text-sm">Waiting...</span>
      </div>
    )
  }

  const colors = COLOR_CLASSES[player.color] || COLOR_CLASSES['neon-blue']

  return (
    <div className={`w-36 bg-card border ${colors.cardBorder} rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-300`}>
      <div className={`w-12 h-12 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
        <span className={`${colors.text} font-bold text-lg`}>
          {player.name.charAt(0)}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-text-primary text-sm font-semibold">{player.name}</span>
        {player.isHost && (
          <span className="bg-neon-pink/15 text-neon-pink text-xs font-semibold px-2 py-0.5 rounded-full">
            Host
          </span>
        )}
      </div>
    </div>
  )
}

export default PlayerSlot
