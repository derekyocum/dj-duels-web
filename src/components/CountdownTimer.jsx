function CountdownTimer({ timeLeft, totalTime, suddenDeath = false, finals = false }) {
  const percentage = (timeLeft / totalTime) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Sudden death runs blood-red from the start -- it's the biggest element on
  // the screen, and leaving it neon-blue undercut the whole treatment. Finals
  // gets the same idea in gold, but only when a tie hasn't ALSO sent this
  // match to sudden death -- that read as more urgent, so it wins.
  let colorClass = suddenDeath ? 'text-blood' : finals ? 'text-neon-yellow' : 'text-neon-blue'
  let barColor = suddenDeath
    ? 'from-blood-dark to-blood'
    : finals ? 'from-gold-dark to-neon-yellow' : 'from-neon-blue to-neon-purple'
  let glowColor = suddenDeath
    ? 'shadow-[0_0_24px_rgba(255,31,61,0.45)]'
    : finals ? 'shadow-[0_0_24px_rgba(255,240,31,0.4)]' : 'shadow-[0_0_20px_rgba(0,128,255,0.3)]'

  // The low-time warning still escalates, but red-on-red (or gold-on-gold)
  // reads as no change -- both specialty states only shift their glow.
  if (suddenDeath) {
    if (timeLeft <= 15) glowColor = 'shadow-[0_0_34px_rgba(255,31,61,0.75)]'
  } else if (finals) {
    if (timeLeft <= 15) glowColor = 'shadow-[0_0_34px_rgba(255,240,31,0.75)]'
  } else if (timeLeft <= 15) {
    colorClass = 'text-neon-pink'
    barColor = 'from-neon-pink to-neon-pink'
    glowColor = 'shadow-[0_0_20px_rgba(255,45,149,0.4)]'
  } else if (timeLeft <= 30) {
    colorClass = 'text-neon-yellow'
    barColor = 'from-neon-yellow to-neon-blue'
    glowColor = 'shadow-[0_0_20px_rgba(255,240,31,0.3)]'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`text-5xl font-mono font-bold ${colorClass} transition-colors duration-500 ${glowColor} rounded-2xl px-6 py-3 bg-card/60 border border-text-muted/15`}>
        {display}
      </div>
      <div className="w-full max-w-xs h-1.5 bg-card rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default CountdownTimer
