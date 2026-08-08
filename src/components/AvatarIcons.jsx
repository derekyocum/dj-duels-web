// Hand-drawn (not stock/stock-photo) profile picture icons -- entirely
// original line art, same stroke-based idiom NowPlaying's HeartIcon already
// established (viewBox 0 0 24, fill=none, stroke=currentColor), so there's
// no copyright question and each renders in whatever accent color its
// AVATAR_OPTIONS entry assigns (see avatarOptions.js).
const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }

function Icon({ size, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...STROKE}>
      {children}
    </svg>
  )
}

export function VinylIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function HeadphonesIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <rect x="2" y="13" width="4" height="7" rx="2" />
      <rect x="18" y="13" width="4" height="7" rx="2" />
    </Icon>
  )
}

export function MicrophoneIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </Icon>
  )
}

export function SpeakerIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="7.5" r="1.8" />
      <circle cx="12" cy="15" r="4" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function TurntableIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="9" cy="12" r="5" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <line x1="15" y1="7" x2="19" y2="10" />
      <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function MixerIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7.5" y1="7" x2="7.5" y2="17" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <line x1="16.5" y1="7" x2="16.5" y2="17" />
      <rect x="6" y="8.5" width="3" height="2" rx="1" fill="currentColor" stroke="none" />
      <rect x="10.5" y="12.5" width="3" height="2" rx="1" fill="currentColor" stroke="none" />
      <rect x="15" y="10" width="3" height="2" rx="1" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function BoomboxIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="3" y="8" width="18" height="11" rx="2" />
      <path d="M7 8V5a5 5 0 0 1 10 0v3" />
      <circle cx="8" cy="13.5" r="2.5" />
      <circle cx="16" cy="13.5" r="2.5" />
    </Icon>
  )
}

export function CassetteIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2.3" />
      <circle cx="8" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="2.3" />
      <circle cx="16" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <rect x="9.5" y="16" width="5" height="1.5" rx="0.5" />
    </Icon>
  )
}

export function GuitarIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <ellipse cx="9" cy="16" rx="6" ry="5" />
      <circle cx="9" cy="16" r="1.8" />
      <rect x="10.5" y="3" width="2" height="12" />
      <rect x="10" y="2" width="3" height="2" rx="0.5" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function RadioIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <line x1="17" y1="7" x2="20" y2="2" />
      <circle cx="8" cy="13" r="3" />
      <circle cx="16" cy="11" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="0.8" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function PianoIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="2" y="6" width="20" height="12" rx="1" />
      <line x1="6.4" y1="6" x2="6.4" y2="18" />
      <line x1="10.8" y1="6" x2="10.8" y2="18" />
      <line x1="15.2" y1="6" x2="15.2" y2="18" />
      <line x1="19.6" y1="6" x2="19.6" y2="18" />
      <rect x="5.3" y="6" width="2.2" height="7" fill="currentColor" stroke="none" />
      <rect x="10.9" y="6" width="2.2" height="7" fill="currentColor" stroke="none" />
      <rect x="16.5" y="6" width="2.2" height="7" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function SoundwaveIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="2.5" y="8" width="3" height="8" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="6.5" y="5" width="3" height="14" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="10.5" y="2" width="3" height="20" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="14.5" y="5" width="3" height="14" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="18.5" y="8" width="3" height="8" rx="1.5" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function TrumpetIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <path d="M2 12h9" />
      <path d="M11 8v8" />
      <circle cx="13.5" cy="9" r="1.3" />
      <circle cx="13.5" cy="15" r="1.3" />
      <path d="M11 12h6" />
      <path d="M17 9v6a3 3 0 0 0 5 2.2V9.8A3 3 0 0 0 17 9Z" />
    </Icon>
  )
}

export function SaxophoneIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <path d="M9 2h5l2 2" />
      <path d="M11 4v9" />
      <path d="M11 13a5 5 0 1 0 5 5" />
      <circle cx="16" cy="18" r="1.6" />
      <circle cx="9" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="9" cy="11" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function DrumKitIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <ellipse cx="12" cy="15" rx="7" ry="3" />
      <path d="M5 15v-3a7 3 0 0 1 14 0v3" />
      <circle cx="19" cy="6" r="3" />
      <path d="M6 6.5 3 5" />
      <path d="M6.5 5v-2" />
    </Icon>
  )
}

export function ViolinIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <path d="M11 2v6" />
      <rect x="9.3" y="1.3" width="3.4" height="2" rx="0.6" fill="currentColor" stroke="none" />
      <path d="M8 8c-1.5 1-2 2.4-1.2 3.8.8 1.3 2.4 1.2 2.9-.1.5 1.3 2.1 1.4 2.9.1.8-1.4.3-2.8-1.2-3.8Z" />
      <path d="M9.5 11.5c-1 1.5-1 3 0 5.5s2.5 4 3.5 2.5" />
      <circle cx="13.5" cy="19" r="1.4" />
    </Icon>
  )
}

export function SynthIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="2" y="9" width="20" height="10" rx="2" />
      <line x1="6" y1="9" x2="6" y2="19" />
      <line x1="10" y1="9" x2="10" y2="19" />
      <line x1="14" y1="9" x2="14" y2="19" />
      <line x1="18" y1="9" x2="18" y2="19" />
      <circle cx="7" cy="6" r="1.4" />
      <circle cx="12" cy="5" r="1.4" />
      <circle cx="17" cy="6" r="1.4" />
    </Icon>
  )
}

export function TambourineIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="4.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  )
}
