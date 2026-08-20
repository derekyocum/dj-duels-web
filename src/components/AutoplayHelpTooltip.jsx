import { useState } from 'react'

/**
 * Safari (and locked-down Chrome profiles) block autoplay for anything that
 * isn't started by a direct click -- which is exactly how tracks start here,
 * since playback kicks off from a WebSocket event, not a click. Nothing in
 * this app can override that browser policy, so this just tells people where
 * to flip it, rather than leaving them staring at a black video with no
 * explanation. Collapsed by default so it doesn't compete with the actual
 * now-playing info for space.
 */
// Lounge is ember-branded, Duel's Stage colors itself per-player -- rather
// than hardcode one accent, the caller passes whichever text-{color} utility
// class already applies in that context.
function AutoplayHelpTooltip({ accentClass = 'text-ember', hoverClass = 'hover:text-ember', className = '' }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`mt-1 ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`text-text-muted text-[11px] ${hoverClass} transition-colors cursor-pointer`}
      >
        Content not autoplaying? {open ? '▾' : '▸'}
      </button>
      {open && (
        <p className="text-text-muted text-[11px] mt-1">
          Safari blocks autoplay until you allow it for this site.{' '}
          <a
            href="https://support.apple.com/guide/safari/ibrw29c6ecf8/mac"
            target="_blank"
            rel="noopener noreferrer"
            className={`${accentClass} font-semibold hover:underline`}
          >
            How to enable it
          </a>
        </p>
      )}
    </div>
  )
}

export default AutoplayHelpTooltip
