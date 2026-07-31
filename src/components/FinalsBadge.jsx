// A specialty treatment for the last match of a tournament -- layered ON TOP
// of the normal neon-blue/purple look rather than replacing it (unlike sudden
// death, which strips the screen down). Reuses neon-yellow (already the app's
// trophy/achievement color) so this reads as "extra shine," not a new theme.
export function FinalsBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30 shadow-[0_0_20px_-6px_rgba(255,240,31,0.5)]">
      <span className="text-sm leading-none">👑</span>
      Final
    </span>
  )
}

/** Warm gold wash meant to sit behind everything else, on top of the page's
 *  own background -- a specialty occasion, not a takeover. */
export function FinalsGlow() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(60% 42% at 50% -8%, rgba(255,240,31,0.14), transparent 62%),' +
          'radial-gradient(45% 30% at 50% 106%, rgba(184,134,11,0.10), transparent 60%)',
      }}
    />
  )
}
