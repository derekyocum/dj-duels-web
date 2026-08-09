import logoSrc from '../assets/logo.png'

// The brand mark. logo.png is the official neon "DJ" artwork with its
// near-black background chroma-keyed to transparent (the source file has
// none), so it drops onto the app's dark background with no visible edge.
function Logo({ className = 'w-7 h-7' }) {
  return <img src={logoSrc} className={className} alt="" aria-hidden="true" style={{ objectFit: 'contain' }} />
}

export default Logo
