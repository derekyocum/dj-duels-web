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

// Upright, with frets and a headstock. The old diagonal body-plus-thin-stick
// version read as a magnifying glass -- the frets are what stop it.
export function GuitarIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <ellipse cx="12" cy="17.5" rx="5.5" ry="4.5" />
      <circle cx="12" cy="17.5" r="1.5" />
      <path d="M10.5 13.5V5h3v8.5" />
      <line x1="10.5" y1="7.2" x2="13.5" y2="7.2" />
      <line x1="10.5" y1="9.8" x2="13.5" y2="9.8" />
      <rect x="9.9" y="2.4" width="4.2" height="2.6" rx="0.7" />
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
      <circle cx="2.8" cy="12" r="1.2" />
      <line x1="4" y1="12" x2="6" y2="12" />
      <rect x="6" y="9.5" width="10" height="5" rx="1.2" />
      <path d="M16 9l5-3.2v12.4L16 15z" />
      <line x1="8.7" y1="9.5" x2="8.7" y2="6.4" />
      <line x1="11" y1="9.5" x2="11" y2="6.4" />
      <line x1="13.3" y1="9.5" x2="13.3" y2="6.4" />
    </Icon>
  )
}

// The bell has to be a big open wedge -- an earlier version tapered it to a
// small curl and the whole thing read as a candy cane.
export function SaxophoneIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="4.6" y="1.6" width="2.6" height="2.4" rx="0.8" />
      <path d="M5.9 4v10.6c0 3.3 2.4 5.5 5.5 5.2 3-.3 4.6-2.6 4.6-5.6v-2" />
      <path d="M16 12.2L10.9 5.9h10.2z" />
      <circle cx="5.9" cy="7.3" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="5.9" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  )
}

// Side-on cylinder with lugs. A head-on circle plus a cymbal-on-a-stand read
// as a lollipop next to a clock; the hoop-and-shell silhouette is the thing
// that actually says "drum".
export function DrumKitIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <ellipse cx="12" cy="7.5" rx="8" ry="3" />
      <path d="M4 7.5v8a8 3 0 0 0 16 0v-8" />
      <line x1="12" y1="10.6" x2="12" y2="18.6" />
      <line x1="6.6" y1="9.6" x2="6.6" y2="17.3" />
      <line x1="17.4" y1="9.6" x2="17.4" y2="17.3" />
    </Icon>
  )
}

// Pinched waist + paired f-holes + a scroll instead of a headstock. Those are
// the three things that separate it from GuitarIcon, which keeps a round body,
// a round soundhole and frets. A bow laid across the body just read as a
// strikethrough, so it's gone.
export function ViolinIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <path d="M12 8.8c-2.6 0-4 1.5-4 3.1 0 1.1.9 1.6.9 2.4 0 1-1.4 1.4-1.4 2.9 0 2 2 3.4 4.5 3.4s4.5-1.4 4.5-3.4c0-1.5-1.4-1.9-1.4-2.9 0-.8.9-1.3.9-2.4 0-1.6-1.4-3.1-4-3.1z" />
      <line x1="10.2" y1="13.6" x2="10.2" y2="17.2" />
      <line x1="13.8" y1="13.6" x2="13.8" y2="17.2" />
      <path d="M11 8.8V4.6" />
      <path d="M13 8.8V4.6" />
      <circle cx="12" cy="3.4" r="1.5" />
    </Icon>
  )
}

// Fat knobs over a short keyboard -- the previous tall-thin version read as a
// comb, and needed more separation from PianoIcon anyway.
export function SynthIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <rect x="2.5" y="12.5" width="19" height="7.5" rx="1.5" />
      <line x1="7" y1="12.5" x2="7" y2="20" />
      <line x1="11" y1="12.5" x2="11" y2="20" />
      <line x1="15" y1="12.5" x2="15" y2="20" />
      <line x1="19" y1="12.5" x2="19" y2="20" />
      <circle cx="6.5" cy="7" r="2.2" />
      <circle cx="12" cy="7" r="2.2" />
      <circle cx="17.5" cy="7" r="2.2" />
    </Icon>
  )
}

// Frame + drum head + jingles seated in the rim. The head is what makes this
// a tambourine rather than a circle with dots on it.
export function TambourineIcon({ size = 24 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5.5" />
      <ellipse cx="12" cy="3.5" rx="1.6" ry="1" />
      <ellipse cx="20.5" cy="12" rx="1" ry="1.6" />
      <ellipse cx="12" cy="20.5" rx="1.6" ry="1" />
      <ellipse cx="3.5" cy="12" rx="1" ry="1.6" />
    </Icon>
  )
}
