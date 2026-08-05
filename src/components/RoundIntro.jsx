// Accent per bracket round. Deliberately mirrors the orb palette in
// orbColors.js -- same server round labels, same hues -- so the title card
// and the background it sits on agree. Keep the two in step if either moves.
// Literal class strings (not interpolated) so Tailwind can see them.
const ACCENT = {
  'Round of 32': 'text-neon-cyan',
  'Round of 16': 'text-neon-green',
  Quarterfinal: 'text-neon-blue',
  Semifinal: 'text-neon-purple',
  Final: 'text-neon-yellow',
}
const DEFAULT_ACCENT = 'text-neon-blue'

/**
 * The stage's opening title card: what round this is and who's in it, in the
 * round's own color. Shown for ROUND_INTRO_MS before the first track plays
 * (and only then -- the shorter beat between the two songs of a match keeps
 * the old quiet fade, since by then everyone knows where they are).
 *
 * The server pays for this window out of its own cushion (GameController's
 * STAGE_INTRO_MS), so the card costs nobody any playback time.
 */
function RoundIntro({ roundLabel, isSuddenDeath, suddenDeathRound, isFinalSuddenDeath, player1, player2 }) {
  const isFinals = roundLabel === 'Final' && !isSuddenDeath
  const accent = isSuddenDeath ? 'text-blood' : (ACCENT[roundLabel] ?? DEFAULT_ACCENT)

  const title = isSuddenDeath
    ? `Sudden Death${suddenDeathRound > 1 ? ` ${suddenDeathRound}` : ''}`
    : isFinals
      ? 'The Final'
      : (roundLabel || 'Battle')

  const subtitle = isSuddenDeath
    ? (isFinalSuddenDeath ? 'Last call — tie again and the votes decide it' : 'New tracks, new vote')
    : isFinals
      ? 'Winner takes the whole thing'
      : null

  return (
    <div className="flex flex-col items-center text-center gap-4 px-6">
      {isFinals && (
        <span className="text-5xl md:text-6xl animate-intro-rise" aria-hidden="true">👑</span>
      )}
      {isSuddenDeath && (
        <span className="text-5xl md:text-6xl animate-intro-rise" aria-hidden="true">⚔️</span>
      )}

      <h2
        className={`${accent} font-black uppercase tracking-[0.14em] text-3xl md:text-5xl animate-intro-rise`}
        style={{ animationDelay: '90ms' }}
      >
        {title}
      </h2>

      {subtitle && (
        <p className="text-text-secondary text-sm animate-intro-rise" style={{ animationDelay: '180ms' }}>
          {subtitle}
        </p>
      )}

      <div
        className="flex items-center gap-4 md:gap-6 mt-1 animate-intro-rise"
        style={{ animationDelay: '280ms' }}
      >
        <span className="text-text-primary font-bold text-lg md:text-2xl truncate max-w-[9rem] md:max-w-none">
          {player1?.name}
        </span>
        <span className={`${accent} text-xs md:text-sm font-black uppercase tracking-[0.2em]`}>vs</span>
        <span className="text-text-primary font-bold text-lg md:text-2xl truncate max-w-[9rem] md:max-w-none">
          {player2?.name}
        </span>
      </div>
    </div>
  )
}

export default RoundIntro
