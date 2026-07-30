const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateDuelId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join('')
}

export const PLAYER_NAMES = [
  'DJ Shadow',
  'MC Thunder',
  'BeatDropper',
  'VinylQueen',
  'BassBoss',
  'TrackStar',
  'MixMaster',
]

// Must stay at least MAX_PLAYERS long and match GameSession.PLAYER_COLORS
// order -- the server assigns by index, this is only the optimistic local guess
// for the very first render before the real roster arrives.
export const PLAYER_COLORS = [
  'neon-blue',
  'neon-pink',
  'neon-purple',
  'neon-green',
  'neon-yellow',
  'neon-orange',
  'neon-cyan',
]
