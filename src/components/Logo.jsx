// The brand mark: a vinyl record disc, echoed by public/favicon.svg (which
// must stay a static file, so the two are kept visually in sync by hand
// rather than shared code).
function Logo({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="logo-disc" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1b1b2c" />
          <stop offset="70%" stopColor="#0d0d15" />
          <stop offset="100%" stopColor="#060609" />
        </radialGradient>
        <linearGradient id="logo-label" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0080ff" />
          <stop offset="100%" stopColor="#8b2fe8" />
        </linearGradient>
        <clipPath id="logo-clip">
          <circle cx="24" cy="24" r="22" />
        </clipPath>
      </defs>

      <circle cx="24" cy="24" r="22" fill="url(#logo-disc)" stroke="#8b2fe8" strokeOpacity="0.55" strokeWidth="1.2" />

      <g clipPath="url(#logo-clip)">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="0.7" />
        <circle cx="24" cy="24" r="16" fill="none" stroke="#fff" strokeOpacity="0.09" strokeWidth="0.7" />
        <circle cx="24" cy="24" r="13" fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="0.7" />
        <ellipse cx="15" cy="13" rx="12" ry="5" fill="#fff" fillOpacity="0.09" transform="rotate(-35 15 13)" />
      </g>

      <circle cx="24" cy="24" r="9" fill="url(#logo-label)" />
      <circle cx="24" cy="24" r="9" fill="none" stroke="#ff2d95" strokeWidth="1.1" />
      <circle cx="24" cy="24" r="1.8" fill="#060609" />
      <circle cx="24" cy="24" r="1.8" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.5" />
    </svg>
  )
}

export default Logo
