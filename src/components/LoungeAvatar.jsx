import { colorForUsername } from '../utils/avatarColor'

const BG = {
  'neon-blue': 'bg-neon-blue/20', 'neon-pink': 'bg-neon-pink/20', 'neon-purple': 'bg-neon-purple/20',
  'neon-green': 'bg-neon-green/20', 'neon-yellow': 'bg-neon-yellow/20', 'neon-orange': 'bg-neon-orange/20',
  'neon-cyan': 'bg-neon-cyan/20',
}
const BORDER = {
  'neon-blue': 'border-neon-blue/50', 'neon-pink': 'border-neon-pink/50', 'neon-purple': 'border-neon-purple/50',
  'neon-green': 'border-neon-green/50', 'neon-yellow': 'border-neon-yellow/50', 'neon-orange': 'border-neon-orange/50',
  'neon-cyan': 'border-neon-cyan/50',
}
const TEXT = {
  'neon-blue': 'text-neon-blue', 'neon-pink': 'text-neon-pink', 'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green', 'neon-yellow': 'text-neon-yellow', 'neon-orange': 'text-neon-orange',
  'neon-cyan': 'text-neon-cyan',
}
const DOT = {
  'neon-blue': 'bg-neon-blue', 'neon-pink': 'bg-neon-pink', 'neon-purple': 'bg-neon-purple',
  'neon-green': 'bg-neon-green', 'neon-yellow': 'bg-neon-yellow', 'neon-orange': 'bg-neon-orange',
  'neon-cyan': 'bg-neon-cyan',
}

const SIZE = {
  sm: { circle: 'w-6 h-6', text: 'text-[10px]', dot: 'w-1.5 h-1.5', dotPos: '-bottom-0.5 -right-0.5' },
  md: { circle: 'w-11 h-11', text: 'text-sm', dot: 'w-2.5 h-2.5', dotPos: '-bottom-0.5 -right-0.5' },
  lg: { circle: 'w-16 h-16', text: 'text-xl', dot: 'w-3 h-3', dotPos: 'bottom-0 right-0' },
}

/**
 * A person's "presence" in a Listening Lounge — a colored initial circle,
 * deterministic per username (see avatarColor.js), with an optional live-dot
 * that pulses to sell the "someone's actually here with you" hangout feel.
 * Same colored-initial idiom the duel flow already uses for players
 * (SpectatorView/Champion/Stage), just extended to the lounge's roster, which
 * has no server-assigned color to begin with.
 */
function LoungeAvatar({ username, size = 'md', present = false, showName = false, className = '' }) {
  const color = colorForUsername(username)
  const s = SIZE[size]

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="relative">
        <div className={`${s.circle} rounded-full ${BG[color]} border-2 ${BORDER[color]} flex items-center justify-center`}>
          <span className={`${TEXT[color]} font-bold ${s.text}`}>{username.charAt(0).toUpperCase()}</span>
        </div>
        {present && (
          <span className={`absolute ${s.dotPos} ${s.dot} rounded-full ${DOT[color]} ring-2 ring-midnight animate-glow-pulse`} />
        )}
      </div>
      {showName && (
        <span className="text-text-secondary text-xs font-medium truncate max-w-[4.5rem]">{username}</span>
      )}
    </div>
  )
}

export default LoungeAvatar
