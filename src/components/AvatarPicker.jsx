import { useState } from 'react'
import { AVATAR_OPTIONS, AVATAR_BG, AVATAR_BORDER, AVATAR_TEXT, COLOR_OPTIONS } from '../utils/avatarOptions'
import { setMyAvatar, setMyAvatarColor } from '../utils/api'

/**
 * A grid of musical-equipment icons to pick a profile picture from, plus a
 * fallback: use your initials in a color of your choice instead. Only one of
 * the two is ever visible at once (see Avatar.jsx -- an icon always wins over
 * the letter), so picking a color explicitly clears any chosen icon rather
 * than saving silently alongside it.
 *
 * Every choice saves immediately (no separate "confirm" step -- there's
 * nothing to reconsider once you've seen the options) and the modal closes
 * itself; `onSaved` hands back both fields so Profile can update its header
 * circle without a full stats refetch.
 */
function AvatarPicker({ current, currentColor, onSaved, onClose }) {
  const [saving, setSaving] = useState(null) // icon id or color currently in flight

  const chooseIcon = async (id) => {
    if (saving) return
    setSaving(id)
    try {
      await setMyAvatar(id)
      onSaved({ avatarId: id, avatarColor: currentColor })
      onClose()
    } catch {
      setSaving(null)
    }
  }

  const chooseColor = async (color) => {
    if (saving) return
    setSaving(color)
    try {
      await Promise.all([setMyAvatar(null), setMyAvatarColor(color)])
      onSaved({ avatarId: null, avatarColor: color })
      onClose()
    } catch {
      setSaving(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onClick={onClose}>
      <div
        className="bg-dark-surface border border-text-muted/20 rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold text-text-primary mb-1">Pick a profile picture</h2>
        <p className="text-text-secondary text-sm mb-5">Choose your gear.</p>

        <div className="grid grid-cols-4 gap-3">
          {AVATAR_OPTIONS.map(({ id, label, Icon, color }) => {
            const selected = id === current
            return (
              <button
                key={id}
                onClick={() => chooseIcon(id)}
                disabled={!!saving}
                aria-label={label}
                title={label}
                className={`aspect-square rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer disabled:cursor-not-allowed ${AVATAR_BG[color]} ${
                  selected ? `${AVATAR_BORDER[color]} ring-2 ring-offset-2 ring-offset-dark-surface ring-white/40` : `${AVATAR_BORDER[color]} opacity-70 hover:opacity-100`
                } ${saving && saving !== id ? 'opacity-30' : ''}`}
              >
                <span className={AVATAR_TEXT[color]}>
                  <Icon size={22} />
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-text-muted/10">
          <p className="text-text-secondary text-sm mb-3">Or use your initials, in a color of your choice</p>
          <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((color) => {
              const selected = !current && color === currentColor
              const colorLabel = color.replace('neon-', '')
              return (
                <button
                  key={color}
                  onClick={() => chooseColor(color)}
                  disabled={!!saving}
                  aria-label={`Use initials in ${colorLabel}`}
                  title={`Use initials in ${colorLabel}`}
                  className={`w-9 h-9 rounded-full border-2 transition-colors cursor-pointer disabled:cursor-not-allowed ${AVATAR_BG[color]} ${
                    selected ? `${AVATAR_BORDER[color]} ring-2 ring-offset-2 ring-offset-dark-surface ring-white/40` : `${AVATAR_BORDER[color]} opacity-70 hover:opacity-100`
                  } ${saving && saving !== color ? 'opacity-30' : ''}`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarPicker
