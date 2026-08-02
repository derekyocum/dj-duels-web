import { PLAYER_COLORS } from './duelUtils'

// Deterministic username -> color from the same 7-color neon palette the duel
// flow uses for players. Lounge members have no server-assigned color (the
// roster is just a list of usernames), so every client has to independently
// land on the SAME color for the same person with zero coordination -- a
// stable hash does that for free, where anything random or order-based
// wouldn't stay in sync across clients.
export function colorForUsername(username) {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) | 0
  }
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length]
}
