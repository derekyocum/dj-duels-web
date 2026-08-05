// Color sets for the drifting ambient orbs (see DriftingOrbs.jsx). Three
// entries each, ordered largest -> smallest orb. All from the app's existing
// palette (index.css's @theme block) rather than new hues, so a battle still
// reads as the same app -- only the accent changes per round.
//
// Alphas are deliberately low: these sit BEHIND live content (album art,
// video embeds, vote buttons), so they should register as atmosphere, not
// as something competing for attention.

export const LOUNGE_ORBS = [
  'rgba(255,157,92,0.16)',  // ember
  'rgba(139,47,232,0.13)',  // purple
  'rgba(255,240,31,0.08)',  // a hint of gold
]

// The lights drop and go red. Pushed brighter than the other sets because
// sudden death is meant to feel like a different room entirely.
const SUDDEN_DEATH_ORBS = [
  'rgba(255,31,61,0.20)',   // blood
  'rgba(143,13,30,0.20)',   // blood-dark
  'rgba(255,31,61,0.11)',
]

// Gold on gold for the last match -- layers with FinalsGlow's warm wash into
// "stage lights" rather than a single flat tint.
//
// The mid orb is a true mid-gold rather than the theme's gold-dark (#b8860b)
// -- that token is a genuinely DARK hue, so on this backdrop it read muddy
// rather than gold. It still earns its place in FinalsBadge/FinalsGlow,
// where it's a gradient's deep end rather than a light source.
//
// Alphas are back in line with the other palettes -- the real fix for
// "washed out" was the scrim that used to render on top of these (see
// Stage.jsx), not the alpha here. Cranking the alpha independently of that
// just overcorrected.
const FINAL_ORBS = [
  'rgba(255,240,31,0.16)',  // neon-yellow
  'rgba(255,194,51,0.15)',  // mid gold
  'rgba(255,240,31,0.10)',
]

// Each bracket round gets its own accent, cool early and deepening as the
// tournament narrows. Keyed by the server's own round labels
// (Bracket.labelForRoundsRemaining) so web and mobile land on the same color
// with no extra state to sync -- and so both semifinal matches share the
// semifinal color, which is the point: it's per ROUND, not per match.
const ROUND_ORBS = {
  'Round of 32': [
    'rgba(0,229,255,0.14)',   // cyan
    'rgba(0,128,255,0.12)',
    'rgba(0,229,255,0.08)',
  ],
  'Round of 16': [
    'rgba(57,255,20,0.12)',   // green
    'rgba(0,229,255,0.12)',
    'rgba(57,255,20,0.07)',
  ],
  Quarterfinal: [
    'rgba(0,128,255,0.16)',   // blue
    'rgba(0,229,255,0.12)',
    'rgba(0,128,255,0.09)',
  ],
  Semifinal: [
    'rgba(139,47,232,0.18)',  // purple
    'rgba(255,45,149,0.13)',
    'rgba(139,47,232,0.10)',
  ],
  Final: FINAL_ORBS,
}

// Anything unlabelled or from a bracket bigger than we have a palette for
// (Round of 64+) falls back to the app's default blue/purple.
const DEFAULT_ORBS = [
  'rgba(0,128,255,0.14)',
  'rgba(139,47,232,0.12)',
  'rgba(0,128,255,0.08)',
]

export function orbColorsForRound({ roundLabel, isSuddenDeath }) {
  if (isSuddenDeath) return SUDDEN_DEATH_ORBS
  return ROUND_ORBS[roundLabel] ?? DEFAULT_ORBS
}
