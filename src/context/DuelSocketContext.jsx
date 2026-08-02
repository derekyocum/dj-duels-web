import { useMemo } from 'react'
import { RoomSocketProvider, useRoomSocket, useRoomEvents } from './RoomSocketContext'

/**
 * The duel flow's socket: one STOMP connection shared across every in-duel page
 * (Lobby → Faceoff → Stage → Champion).
 *
 * This is now a thin binding over RoomSocketProvider, which owns the actual
 * connection, token-refresh and outbox behaviour. Only the duel-specific parts
 * live here — which topics to listen on and where to publish a resync — so the
 * Listening Lounge can reuse all of that machinery instead of forking it.
 */
export function DuelSocketProvider({ duelId, children }) {
  const topics = useMemo(() => (duelId ? [
    `/topic/lobby/${duelId}`,
    `/topic/round/${duelId}`,
    // Per-user reply channel for state snapshots (resync).
    '/user/queue/duel',
  ] : []), [duelId])

  const syncBody = useMemo(() => ({ duelId }), [duelId])

  return (
    <RoomSocketProvider topics={topics} syncDestination="/app/duel/sync" syncBody={syncBody}>
      {children}
    </RoomSocketProvider>
  )
}

// Kept as the duel flow's own names so every existing in-duel screen is
// untouched by the generalization.
// eslint-disable-next-line react-refresh/only-export-components
export const useDuelSocket = useRoomSocket
// eslint-disable-next-line react-refresh/only-export-components
export const useDuelEvents = useRoomEvents
