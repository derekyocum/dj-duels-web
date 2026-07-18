import { useEffect, useRef, useState } from 'react'

const SYMBOLS = ['♪', '♫', '♬', '🎵', '🎶', '🎤', '🎧', '🎹', '🎸']
const NEON_COLORS = ['#0080ff', '#ff2d95', '#8b2fe8', '#39ff14', '#fff01f']
const GREY = '#6b6375'
const GLOW_RADIUS = 200

const SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl']

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

const NOTES = (() => {
  const rand = seededRandom(42)
  const notes = []
  for (let i = 0; i < 28; i++) {
    notes.push({
      symbol: Math.floor(rand() * SYMBOLS.length),
      top: `${(rand() * 90 + 2).toFixed(1)}%`,
      left: `${(rand() * 90 + 2).toFixed(1)}%`,
      size: SIZES[Math.floor(rand() * SIZES.length)],
      duration: `${(rand() * 12 + 16).toFixed(0)}s`,
      delay: `-${(rand() * 20).toFixed(0)}s`,
      color: NEON_COLORS[Math.floor(rand() * NEON_COLORS.length)],
    })
  }
  return notes
})()

function MusicNotes() {
  const noteRefs = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)
  const [glowLevels, setGlowLevels] = useState(() => new Array(NOTES.length).fill(0))

  useEffect(() => {
    let scheduled = false

    function computeGlow() {
      scheduled = false
      const { x, y } = mouseRef.current
      const levels = noteRefs.current.map((el) => {
        if (!el) return 0
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        if (dist > GLOW_RADIUS) return 0
        return 1 - dist / GLOW_RADIUS
      })
      setGlowLevels(levels)
    }

    // Recompute only in response to actual movement, coalesced to one pass per
    // frame — NOT a perpetual rAF loop (that re-rendered 60 nodes every frame
    // forever, pegging the main thread and starving scroll/paint).
    function schedule() {
      if (scheduled) return
      scheduled = true
      rafRef.current = requestAnimationFrame(computeGlow)
    }

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      schedule()
    }
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
      schedule()
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {NOTES.map((note, i) => {
        const glow = glowLevels[i]
        const opacity = 0.06 + glow * 0.74
        const color = glow > 0 ? note.color : GREY

        return (
          <span
            key={i}
            ref={(el) => (noteRefs.current[i] = el)}
            className={`absolute ${note.size} select-none animate-float`}
            style={{
              top: note.top,
              left: note.left,
              animationDuration: note.duration,
              animationDelay: note.delay,
              color,
              opacity,
              filter: glow > 0 ? `drop-shadow(0 0 ${12 + glow * 28}px ${note.color}) drop-shadow(0 0 ${4 + glow * 8}px ${note.color})` : 'none',
              transition: 'color 0.3s ease, opacity 0.3s ease, filter 0.3s ease',
            }}
          >
            {SYMBOLS[note.symbol]}
          </span>
        )
      })}
    </div>
  )
}

export default MusicNotes
