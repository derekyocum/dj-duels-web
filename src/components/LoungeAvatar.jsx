import Avatar from './Avatar'
import { avatarById, AVATAR_DOT } from '../utils/avatarOptions'
import { colorForUsername } from '../utils/avatarColor'

const SIZE = {
  sm: { px: 24, dot: 'w-1.5 h-1.5', dotPos: '-bottom-0.5 -right-0.5' },
  md: { px: 44, dot: 'w-2.5 h-2.5', dotPos: '-bottom-0.5 -right-0.5' },
  lg: { px: 64, dot: 'w-3 h-3', dotPos: 'bottom-0 right-0' },
}

/**
 * A person's "presence" in a Listening Lounge -- their real profile picture
 * (see Avatar.jsx) if they've picked an icon or a letter color, otherwise a
 * deterministic per-username color (see avatarColor.js), with an optional
 * live-dot that pulses to sell the "someone's actually here with you" hangout
 * feel. Same idiom the duel flow uses for players (SpectatorView/Champion/
 * Stage), just extended to the lounge's roster.
 */
function LoungeAvatar({ username, avatarId, avatarColor, size = 'md', present = false, showName = false, className = '' }) {
  const s = SIZE[size]
  const color = avatarById(avatarId)?.color ?? avatarColor ?? colorForUsername(username)

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="relative">
        <Avatar username={username} avatarId={avatarId} avatarColor={avatarColor} size={s.px} />
        {present && (
          <span className={`absolute ${s.dotPos} ${s.dot} rounded-full ${AVATAR_DOT[color]} ring-2 ring-midnight animate-glow-pulse`} />
        )}
      </div>
      {showName && (
        <span className="text-text-secondary text-xs font-medium truncate max-w-[4.5rem]">{username}</span>
      )}
    </div>
  )
}

export default LoungeAvatar
