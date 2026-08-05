// Slow glowing orbs that drift edge to edge across a page's background.
// Soft radial gradients, no blur() filter (see index.css's note on why) and
// transform-only animation, so this stays compositor-cheap no matter what's
// rendering on top of it.
//
// `colors` decides the mood and nothing else -- the drift paths, sizes and
// durations are shared, which is what makes the lounge and a battle round
// read as the same effect wearing different colors. See orbColors.js.
const SIZES = ['26rem', '22rem', '18rem']
const ANIMATIONS = ['animate-orb-a', 'animate-orb-b', 'animate-orb-c']

function DriftingOrbs({ colors }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`absolute top-0 left-0 rounded-full ${ANIMATIONS[i]}`}
          style={{
            width: SIZES[i],
            height: SIZES[i],
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  )
}

export default DriftingOrbs
