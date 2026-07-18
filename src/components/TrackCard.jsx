const COLOR_TEXT = {
  'neon-blue': 'text-neon-blue',
  'neon-pink': 'text-neon-pink',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
  'neon-yellow': 'text-neon-yellow',
}

const COLOR_BORDER = {
  'neon-blue': 'border-neon-blue/30',
  'neon-pink': 'border-neon-pink/30',
  'neon-purple': 'border-neon-purple/30',
  'neon-green': 'border-neon-green/30',
  'neon-yellow': 'border-neon-yellow/30',
}

const COLOR_GLOW = {
  'neon-blue': 'shadow-[0_0_30px_rgba(0,128,255,0.2)]',
  'neon-pink': 'shadow-[0_0_30px_rgba(255,45,149,0.2)]',
  'neon-purple': 'shadow-[0_0_30px_rgba(139,47,232,0.2)]',
  'neon-green': 'shadow-[0_0_30px_rgba(57,255,20,0.2)]',
  'neon-yellow': 'shadow-[0_0_30px_rgba(255,240,31,0.2)]',
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function TrackCard({ track, player, revealed = true }) {
  const color = player?.color || 'neon-blue'
  const textClass = COLOR_TEXT[color] || COLOR_TEXT['neon-blue']
  const borderClass = COLOR_BORDER[color] || COLOR_BORDER['neon-blue']
  const glowClass = COLOR_GLOW[color] || COLOR_GLOW['neon-blue']

  if (!revealed) {
    return (
      <div className="bg-card/60 border border-text-muted/20 rounded-2xl p-6 w-full max-w-xs mx-auto">
        <div className="w-full aspect-square rounded-xl bg-card-hover/80 flex items-center justify-center mb-4">
          <span className="text-4xl opacity-30">🎵</span>
        </div>
        <div className="h-5 bg-card-hover/60 rounded-full w-3/4 mx-auto mb-2" />
        <div className="h-4 bg-card-hover/40 rounded-full w-1/2 mx-auto" />
      </div>
    )
  }

  return (
    <div className={`bg-card/60 border ${borderClass} ${glowClass} rounded-2xl p-6 w-full max-w-xs mx-auto transition-all duration-700`}>
      {track.albumArtUrl && (
        <img
          src={track.albumArtUrl}
          alt={`${track.album} cover`}
          className="w-full aspect-square rounded-xl object-cover mb-4"
        />
      )}
      <h3 className={`${textClass} font-bold text-lg truncate`}>{track.name}</h3>
      <p className="text-text-secondary text-sm truncate">{track.artist}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-text-muted text-xs truncate">{track.album}</p>
        {track.durationMs && (
          <span className="text-text-muted text-xs shrink-0 ml-2">{formatDuration(track.durationMs)}</span>
        )}
      </div>
    </div>
  )
}

export default TrackCard
