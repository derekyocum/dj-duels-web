// Sudden death deliberately breaks the app's neon-blue/purple look: near-black,
// blood-red, harder edges. It should feel like the lights dropped.
export const SUDDEN_DEATH_BG =
  'bg-[radial-gradient(80%_60%_at_50%_0%,#2a0409_0%,#120205_45%,#050102_100%)]'

export function SuddenDeathBadge({ round, isFinal }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] rounded-full bg-blood/15 text-blood border border-blood/40 shadow-[0_0_20px_-4px_rgba(255,31,61,0.6)]">
      <span className="w-1.5 h-1.5 rounded-full bg-blood animate-glow-pulse" />
      Sudden Death{round > 1 ? ` ${round}` : ''}
      {isFinal && <span className="text-blood/70">· last call</span>}
    </span>
  )
}

/**
 * The full "we're in a tiebreak" header. tiedVotes is the 🔥 count both tracks
 * landed on, which is what makes the stakes legible -- "you both got 3" explains
 * why nobody won far better than the word "tie" does.
 */
function SuddenDeathBanner({ round, isFinal, tiedFire, subtitle }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2.5 px-6 pt-2 pb-4 text-center">
      <SuddenDeathBadge round={round} isFinal={isFinal} />
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-text-primary">
        Nobody blinked.
      </h2>
      <p className="text-text-secondary text-sm max-w-md">
        {typeof tiedFire === 'number'
          ? `Both tracks pulled ${tiedFire} 🔥. `
          : 'The room split right down the middle. '}
        {subtitle}
      </p>
      {isFinal && (
        <p className="text-blood/80 text-[11px] font-semibold uppercase tracking-wider">
          Tie again and the votes decide it
        </p>
      )}
    </div>
  )
}

export default SuddenDeathBanner
