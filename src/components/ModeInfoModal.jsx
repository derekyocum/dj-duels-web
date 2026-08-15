import { useEffect } from 'react'

// One entry per mode, color-coded to match its buttons on the landing page.
// Kept to a single-sentence flow summary each -- this is the whole app's menu
// explained at a glance, not a manual. Two modes, not three: Find a Duel/Find
// a Lounge are just the matchmaking entry point into the same two modes below,
// not separate concepts, so each entry covers both ways in rather than listing
// matchmaking as its own confusing third item.
const MODES = [
  {
    title: 'Duels',
    accent: 'neon-blue',
    body: 'Battle 1v1 each round while everyone else votes, and the last DJ standing takes the crown. Find a Duel matches you with 4 people instantly — or share a room code to play with people you already know.',
  },
  {
    title: 'Listening Lounge',
    accent: 'ember',
    body: 'No battle, no timer, no winner — just one shared queue everyone listens to together. Find a Lounge matches you with new people instantly — or host one and share the code with friends.',
  },
]

const ACCENT = {
  'neon-blue': { text: 'text-neon-blue', chip: 'bg-neon-blue/15 border-neon-blue/30' },
  ember: { text: 'text-ember', chip: 'bg-ember/15 border-ember/30' },
}

/**
 * One modal covering every mode, opened from the single info icon on the
 * landing page. Color-coded per mode so it reads as a legend for the buttons
 * above it rather than a separate wall of text.
 */
function ModeInfoModal({ isOpen, onClose }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onClick={onClose}>
      <div
        className="bg-dark-surface border border-card rounded-2xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Game modes"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-text-primary mb-5">Game modes</h2>

        <div className="space-y-4">
          {MODES.map((mode) => {
            const accent = ACCENT[mode.accent]
            return (
              <div key={mode.title} className={`rounded-xl border ${accent.chip} px-4 py-3`}>
                <h3 className={`text-sm font-bold ${accent.text} mb-1`}>{mode.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{mode.body}</p>
              </div>
            )
          })}
        </div>

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

export default ModeInfoModal
