import Avatar from './Avatar'

// Card border only -- the circle's own color now comes from the player's
// real avatar (see Avatar.jsx), not the duel-session slot color below.
const CARD_BORDER = {
  'neon-blue': 'border-neon-blue/30', 'neon-pink': 'border-neon-pink/30', 'neon-purple': 'border-neon-purple/30',
  'neon-green': 'border-neon-green/30', 'neon-yellow': 'border-neon-yellow/30',
}

function PlayerSlot({ player, avatars = {} }) {
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

  const cardBorder = CARD_BORDER[player.color] || CARD_BORDER['neon-blue']

  return (
    <div className={`w-36 bg-card border ${cardBorder} rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-300`}>
      <Avatar
        username={player.name}
        avatarId={avatars[player.name]?.avatarId}
        avatarColor={avatars[player.name]?.avatarColor}
        size={48}
      />
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
