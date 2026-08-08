import CountdownTimer from './CountdownTimer'
import Avatar from './Avatar'

const COLOR_GLOW = {
  'neon-blue': 'shadow-[0_0_25px_rgba(0,128,255,0.3)]',
  'neon-pink': 'shadow-[0_0_25px_rgba(255,45,149,0.3)]',
  'neon-purple': 'shadow-[0_0_25px_rgba(139,47,232,0.3)]',
  'neon-green': 'shadow-[0_0_25px_rgba(57,255,20,0.3)]',
  'neon-yellow': 'shadow-[0_0_25px_rgba(255,240,31,0.3)]',
}

// The glow ring around each battler's avatar still comes from the duel-slot
// color (P1 vs P2 contrast) -- only the circle's own content now comes from
// the player's real avatar (see Avatar.jsx).
function PlayerAvatar({ player, avatars = {} }) {
  const glow = COLOR_GLOW[player.color] || COLOR_GLOW['neon-blue']
  const avatar = avatars[player.name]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`rounded-full ${glow} transition-all duration-300`}>
        <Avatar username={player.name} avatarId={avatar?.avatarId} avatarColor={avatar?.avatarColor} size={80} borderWidth={2} />
      </div>
      <span className="text-text-primary font-semibold text-lg">{player.name}</span>
    </div>
  )
}

function SpectatorView({ player1, player2, timeLeft, totalTime = 90, roundNum, roundLabel, suddenDeath = false, finals = false, avatars = {} }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <span className={`inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-8 ${
        suddenDeath
          ? 'bg-blood/10 text-blood border border-blood/30'
          : finals
            ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30'
            : 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
      }`}>
        {finals && !suddenDeath && <span className="mr-1">👑</span>}
        {roundLabel || `Round ${roundNum}`}
      </span>

      <div className="flex items-center gap-6 sm:gap-10 mb-10">
        <PlayerAvatar player={player1} avatars={avatars} />

        <div className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black text-text-muted/60 tracking-tighter">VS</span>
        </div>

        <PlayerAvatar player={player2} avatars={avatars} />
      </div>

      <div className="mb-8">
        <CountdownTimer timeLeft={timeLeft} totalTime={totalTime} suddenDeath={suddenDeath} finals={finals} />
      </div>

      <div className="flex items-center gap-2 text-text-secondary">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
        <span className="text-sm">Selecting their tracks...</span>
      </div>
    </div>
  )
}

export default SpectatorView
