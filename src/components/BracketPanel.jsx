// Compact single-elimination bracket. `bracket` is the server shape:
// rounds -> matches -> { player1, player2, winner } (nulls are byes / TBD).
// Highlights the live match and the current user, dims eliminated players.
function roundName(roundIndex, totalRounds) {
  const remaining = totalRounds - roundIndex
  if (remaining === 1) return 'Final'
  if (remaining === 2) return 'Semifinals'
  if (remaining === 3) return 'Quarterfinals'
  return `Round of ${2 ** remaining}`
}

function Slot({ name, winner, you }) {
  const decided = !!winner
  const isWinner = name && name === winner
  const isYou = name && name === you
  const cls = !name
    ? 'text-text-muted/40 italic'
    : isWinner
      ? 'text-neon-green font-bold'
      : decided
        ? 'text-text-muted/50 line-through'
        : 'text-text-primary'
  const isOut = decided && !!name && !isWinner
  return (
    <div className="flex items-center justify-between gap-1.5">
      <span className={`truncate ${cls}`}>
        {name || 'TBD'}{isYou && <span className="text-neon-blue font-semibold"> (you)</span>}
      </span>
      {/* Advanced vs knocked out, called out explicitly -- the strikethrough
          alone is easy to miss at this size, and on the round intro card
          people are reading the bracket at a glance. */}
      {isWinner && <span className="text-neon-green text-[10px] shrink-0" aria-label="advanced">✓</span>}
      {isOut && <span className="text-neon-pink/70 text-[10px] shrink-0" aria-label="eliminated">✗</span>}
    </div>
  )
}

function BracketPanel({ bracket, you, className = '' }) {
  if (!Array.isArray(bracket) || bracket.length === 0) return null
  const total = bracket.length

  // Center the whole bracket when it fits (a 1-round Final shouldn't hug the
  // left), but let it scroll from the left once there are enough rounds to
  // overflow. The middle box shrinks to content up to the available width.
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="max-w-full overflow-x-auto">
        <div className="flex gap-3 w-max pb-1">
        {bracket.map((round, ri) => (
          <div key={ri} className="flex flex-col justify-center gap-2 min-w-[128px]">
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-medium text-center">
              {roundName(ri, total)}
            </p>
            {round.map((m, mi) => {
              const live = m.player1 && m.player2 && !m.winner
              return (
                <div
                  key={mi}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                    live
                      ? 'border-neon-blue/60 bg-neon-blue/10 shadow-[0_0_16px_rgba(0,128,255,0.18)]'
                      : 'border-text-muted/15 bg-card/40'
                  }`}
                >
                  <Slot name={m.player1} winner={m.winner} you={you} />
                  <div className="h-px bg-text-muted/10 my-1" />
                  <Slot name={m.player2} winner={m.winner} you={you} />
                </div>
              )
            })}
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default BracketPanel
