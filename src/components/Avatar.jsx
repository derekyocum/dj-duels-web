import { avatarById, AVATAR_BG, AVATAR_BORDER, AVATAR_TEXT } from '../utils/avatarOptions'
import { colorForUsername } from '../utils/avatarColor'

/**
 * The one place that decides what a person's profile picture looks like:
 * their chosen icon (avatarId) if they've picked one, otherwise their initial
 * in their chosen letter color (avatarColor), falling back to a deterministic
 * per-username color for anyone who's never touched either setting. Every
 * screen that shows a person -- duel roster, lounge, leaderboard, friends,
 * profile -- renders through this instead of keeping its own initials logic,
 * so a picked icon (or letter color) shows up everywhere at once.
 *
 * Sized in real pixels via inline style rather than a fixed sm/md/lg set,
 * since call sites span a much wider range (24px lounge dots to 112px
 * Champion hero) than a handful of presets would cover cleanly.
 *
 * showBorder defaults on for standalone use (leaderboard, friends, lounge);
 * duel screens that already frame the circle in their own session-colored
 * card border pass showBorder={false} so the two borders don't stack.
 */
function Avatar({ username, avatarId, avatarColor, size = 44, showBorder = true, borderWidth = 2, className = '' }) {
  const avatar = avatarById(avatarId)
  const color = avatar?.color ?? avatarColor ?? colorForUsername(username || '?')
  const iconSize = Math.round(size * 0.5)
  const fontSize = Math.round(size * 0.42)

  return (
    <div
      className={`rounded-full ${AVATAR_BG[color]} ${showBorder ? AVATAR_BORDER[color] : ''} flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, borderWidth: showBorder ? borderWidth : undefined }}
    >
      {avatar ? (
        <span className={AVATAR_TEXT[color]}>
          <avatar.Icon size={iconSize} />
        </span>
      ) : (
        <span className={`${AVATAR_TEXT[color]} font-bold`} style={{ fontSize }}>
          {(username || '?').charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

export default Avatar
