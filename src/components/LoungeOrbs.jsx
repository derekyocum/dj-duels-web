// Slow glowing orbs that drift edge to edge across the Listening Lounge
// background, replacing the two static "breathing" blobs the lounge started
// with. Same soft-radial-gradient look already established (no blur() filter
// -- see index.css's own note on why), just in motion now. Lounge-only by
// construction: nothing else imports this component.
const ORBS = [
  { size: '26rem', color: 'rgba(255,157,92,0.16)', animation: 'animate-lounge-orb-a' },   // ember
  { size: '22rem', color: 'rgba(139,47,232,0.13)', animation: 'animate-lounge-orb-b' },   // purple
  { size: '18rem', color: 'rgba(255,240,31,0.08)', animation: 'animate-lounge-orb-c' },   // a hint of gold
]

function LoungeOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={`absolute top-0 left-0 rounded-full ${orb.animation}`}
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  )
}

export default LoungeOrbs
