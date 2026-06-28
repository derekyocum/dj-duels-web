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

export const PLAYER_COLORS = [
  'neon-blue',
  'neon-pink',
  'neon-purple',
  'neon-green',
  'neon-yellow',
]
