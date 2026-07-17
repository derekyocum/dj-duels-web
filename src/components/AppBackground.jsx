import MusicNotes from './MusicNotes'

// The shared 2.0 ambient backdrop for every page: a near-black club canvas with
// soft neon glows, a focusing vignette, film grain, and the interactive music
// notes. Defined once so the look stays consistent — pages render <AppBackground />
// (as the first child of a `relative` root) instead of pasting the gradient + orbs.
//
// The glow layer is `absolute inset-0` (covers the full page, scrolls with it) —
// NOT `position: fixed`. A fixed full-viewport backdrop forces the browser to
// repaint the revealed content over it on every scroll frame, which janks/stalls
// low-end compositors. The neon "orbs" are radial-gradients, not blur-filtered
// elements, for the same cheap-repaint reason. Only opacity animates.
function AppBackground() {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden bg-midnight pointer-events-none" aria-hidden="true">
        {/* Neon glow field — spotlight from the top, colored pools around the edges */}
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            background:
              'radial-gradient(60% 40% at 50% -6%, rgba(0,212,255,0.22), transparent 60%),' +
              'radial-gradient(42% 32% at 6% 100%, rgba(179,71,255,0.18), transparent 62%),' +
              'radial-gradient(42% 32% at 96% 104%, rgba(255,45,149,0.15), transparent 62%),' +
              'radial-gradient(30% 24% at 82% 12%, rgba(0,212,255,0.10), transparent 60%)',
          }}
        />

        {/* Focusing vignette — darkens the edges for a spotlit, club feel (kept
            light so it doesn't crush content on taller, scrolling pages) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 30%, transparent 45%, rgba(0,0,0,0.45) 100%)',
          }}
        />

        {/* Film grain */}
        <div className="absolute inset-0 grain opacity-[0.12] mix-blend-soft-light" />
      </div>

      {/* Interactive floating music notes (own fixed layer; glow near the cursor) */}
      <MusicNotes />
    </>
  )
}

export default AppBackground
