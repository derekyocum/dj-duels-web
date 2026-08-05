import { useState } from 'react'
import { AVATAR_OPTIONS, AVATAR_BG, AVATAR_BORDER, AVATAR_TEXT } from '../utils/avatarOptions'
import { setMyAvatar } from '../utils/api'

/**
 * A grid of 12 musical-equipment icons to pick a profile picture from.
 * Selecting one saves immediately (no separate "confirm" step -- there's
 * nothing to reconsider once you've seen the options) and the modal closes
 * itself; `onSaved` hands the new id back so Profile can update the header
 * circle without a full stats refetch.
 */
function AvatarPicker({ current, onSaved, onClose }) {
  const [saving, setSaving] = useState(null) // id currently in flight

  const choose = async (id) => {
    if (saving) return
    setSaving(id)
    try {
      await setMyAvatar(id)
      onSaved(id)
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
                onClick={() => choose(id)}
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
      </div>
    </div>
  )
}

export default AvatarPicker
