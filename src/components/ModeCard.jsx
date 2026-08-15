// Line-art replacements for the sword/headphones emoji the first pass used --
// drawn in the same stroke style as Landing's own info-icon SVG, so they read
// as part of the app rather than a system emoji font.
function DuelIcon() {
  // A single blade rather than two crossed lines -- crossed thin diagonals at
  // this size collapsed into a plain X (which reads as "cancel", not
  // "battle"), and the crossguard tick + pommel dot alone already carry
  // "sword" without needing a second overlapping line to fight for legibility
  // against.
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <line x1="18" y1="6" x2="7" y2="17" />
      <line x1="8.3" y1="11.7" x2="12.3" y2="15.7" />
      <circle cx="6" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LoungeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="13" width="4" height="7" rx="2" />
      <rect x="17.5" y="13" width="4" height="7" rx="2" />
    </svg>
  )
}

const ICON = { duel: DuelIcon, lounge: LoungeIcon }

const ACCENT = {
  duel: {
    name: 'text-neon-blue',
    chip: 'bg-neon-blue/10 border-neon-blue/25 text-neon-blue',
    border: 'border-neon-blue/15 hover:border-neon-blue/35',
    gradient: 'from-neon-blue to-neon-purple',
    glow: 'rgba(0,128,255,0.5)',
    tint: 'rgba(0,128,255,0.12)',
  },
  lounge: {
    name: 'text-ember',
    chip: 'bg-ember/10 border-ember/25 text-ember',
    border: 'border-ember/15 hover:border-ember/35',
    gradient: 'from-ember to-neon-orange',
    glow: 'rgba(255,157,92,0.5)',
    tint: 'rgba(255,157,92,0.12)',
  },
}

/**
 * One mode, one card: what it is, the matchmaking entry point, and a quiet
 * "Private Lobby" fallback for people bringing their own crew (PrivateDuelModal
 * / LoungeModal -- both now the same one-modal-handles-create-and-join shape,
 * so codeAction is always a single onClick). Replaces the old
 * entry-method-first layout (a Find Match trigger, a Create a Lobby trigger,
 * sitting apart from each other) with a mode-first one -- Duel and Lounge each
 * explain and offer themselves in one place, which is also why the two of
 * these together retire the separate "What's the difference?" modal.
 */
function ModeCard({ mode, name, description, findLabel, onFind, codeLabel = 'Private Lobby', codeAction }) {
  const accent = ACCENT[mode]
  const Icon = ICON[mode]

  return (
    <div className={`group relative rounded-2xl border ${accent.border} bg-card/40 overflow-hidden p-6 flex flex-col items-start text-left transition-all duration-300 hover:-translate-y-1`}>
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(120% 90% at 50% -10%, ${accent.tint}, transparent 65%)` }}
      />

      <div className={`relative w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${accent.chip}`}>
        <Icon />
      </div>

      <h3 className={`relative text-2xl font-black tracking-tight mb-1.5 ${accent.name}`}>{name}</h3>
      <p className="relative text-text-secondary text-sm leading-relaxed mb-6">{description}</p>

      <button
        onClick={onFind}
        className={`relative w-full py-3 mb-3 text-sm font-bold rounded-full bg-gradient-to-r ${accent.gradient} text-white transition-all duration-300 hover:-translate-y-0.5`}
        style={{ boxShadow: `0 0 24px -6px ${accent.glow}` }}
      >
        {findLabel}
      </button>

      <button
        onClick={codeAction}
        className="relative text-text-muted hover:text-text-secondary text-xs font-semibold underline decoration-text-muted/30 underline-offset-4 transition-colors cursor-pointer"
      >
        {codeLabel}
      </button>
    </div>
  )
}

export default ModeCard
