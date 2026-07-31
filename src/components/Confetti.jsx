const CONFETTI_COLORS = ['#0080ff', '#8b2fe8', '#ff2d95', '#39ff14', '#fff01f', '#ff7a1f']
const CONFETTI_COUNT = 26
const BALLOON_COUNT = 6

/**
 * Ambient background celebration for the Champion screen -- confetti falling
 * plus balloons drifting up, both looping for as long as the screen stays
 * mounted (complementary to the existing one-shot Fireworks burst on entry).
 *
 * Pure CSS keyframe animations, transform + opacity only -- no blur()/filter,
 * same discipline AppBackground's own comments establish elsewhere in this
 * app (blur compositing was a real scroll-jank source there).
 *
 * The random per-piece layout is computed ONCE, here at module scope, not
 * inside the component -- react-hooks/purity flags Math.random() called
 * during render (including inside useMemo, since the rule cares about WHEN
 * it runs, not whether the result gets memoized). Module scope only runs once
 * at import time, which is what the existing Fireworks component sidesteps
 * the same rule for too, just via deterministic angle math instead.
 */
const PIECES = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  width: 6 + Math.random() * 5,
  height: 10 + Math.random() * 6,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: 6 + Math.random() * 5,
  delay: Math.random() * 9,
  drift: Math.round((Math.random() - 0.5) * 70),
}))

const BALLOONS = Array.from({ length: BALLOON_COUNT }, (_, i) => ({
  id: i,
  left: 4 + Math.random() * 88,
  size: 30 + Math.random() * 16,
  duration: 15 + Math.random() * 9,
  delay: Math.random() * 12,
}))

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.9; }
          92%  { opacity: 0.85; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(560deg); opacity: 0; }
        }
        @keyframes balloon-float {
          0%   { transform: translateY(15vh) translateX(0); opacity: 0; }
          10%  { opacity: 0.5; }
          50%  { transform: translateY(-50vh) translateX(14px); }
          100% { transform: translateY(-120vh) translateX(-12px); opacity: 0; }
        }
      `}</style>
      {PIECES.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: 2,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
      {BALLOONS.map((b) => (
        <span
          key={`b${b.id}`}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${b.left}%`,
            fontSize: b.size,
            animation: `balloon-float ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        >
          🎈
        </span>
      ))}
    </div>
  )
}

export default Confetti
