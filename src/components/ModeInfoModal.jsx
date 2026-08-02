import { useEffect } from 'react'

// One entry per mode. Kept deliberately short: this is the first thing a new
// player reads, so it explains the shape of the mode and gets out of the way.
const MODES = {
  duel: {
    title: 'Duels',
    tagline: 'Music battles with your friends.',
    accent: 'neon-blue',
    steps: [
      'Make a room and share the code. Up to seven people can pile in.',
      'Each round, two DJs put up a track and everyone else votes on which one hits.',
      'Winners move on. Last one standing takes the crown.',
    ],
  },
  match: {
    title: 'Find a Match',
    tagline: 'The same game, minus the group chat.',
    accent: 'neon-purple',
    steps: [
      'We pair you up with three other players.',
      'The duel starts the moment the fourth person lands.',
      'No code to share, no waiting on your friends to check their phones.',
    ],
  },
  lounge: {
    title: 'Listening Lounge',
    tagline: 'No battle. Just music.',
    accent: 'ember',
    steps: [
      'Start a room and invite your friends — only friends can get in.',
      'Everyone adds to one shared queue, from Spotify or YouTube.',
      'You all hear the same thing at the same time.',
      'Tired of a track? Vote to skip. If most of the room agrees, it moves on.',
    ],
  },
}

const ACCENT = {
  'neon-blue': { text: 'text-neon-blue', chip: 'bg-neon-blue/15 border-neon-blue/30', button: 'from-neon-blue to-neon-purple' },
  'neon-purple': { text: 'text-neon-purple', chip: 'bg-neon-purple/15 border-neon-purple/30', button: 'from-neon-purple to-neon-pink' },
  ember: { text: 'text-ember', chip: 'bg-ember/15 border-ember/30', button: 'from-ember to-neon-purple' },
}

/**
 * Explains one mode, opened from the info icon beside it on the landing page.
 * Same shell conventions as the app's other modals (backdrop click, Escape,
 * corner close) so it behaves the way the rest of the app already does.
 *
 * @param mode one of MODES; null/unknown closes it
 */
function ModeInfoModal({ mode, onClose }) {
  useEffect(() => {
    if (!mode) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode, onClose])

  const content = mode ? MODES[mode] : null
  if (!content) return null

  const accent = ACCENT[content.accent]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onClick={onClose}>
      <div
        className="bg-dark-surface border border-card rounded-2xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className={`text-lg font-bold ${accent.text}`}>{content.title}</h2>
        <p className="text-text-secondary text-sm mt-1 mb-5">{content.tagline}</p>

        <ol className="space-y-3">
          {content.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className={`shrink-0 w-6 h-6 rounded-full border ${accent.chip} ${accent.text} flex items-center justify-center text-xs font-bold`}>
                {i + 1}
              </span>
              <span className="text-text-secondary text-sm leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>

        <button
          onClick={onClose}
          className={`mt-6 w-full py-3 text-sm font-bold rounded-full bg-gradient-to-r ${accent.button} text-white transition-all duration-300 cursor-pointer`}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export default ModeInfoModal
