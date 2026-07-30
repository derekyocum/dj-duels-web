import { useEffect } from 'react'

const STEPS = [
  'Share the code, then start when your crew’s in.',
  'Each match, two DJs pick a track — the whole room votes 🔥 or 🗑️ on both.',
  'Winners advance round by round until one takes the crown 👑.',
]

// Was an always-on card in the lobby; it's the same content behind a small
// button now so it isn't permanently eating vertical space above the roster.
function HowItWorksModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-surface border border-card rounded-2xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-text-primary mb-5">How it works</h2>
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center text-neon-blue text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-text-secondary text-sm leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 text-sm font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export default HowItWorksModal
