import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router'
import ProtectedRoute from './ProtectedRoute'
import { RoomSocketProvider } from '../context/RoomSocketContext'

/**
 * Holds the lounge's STOMP connection above the routed page, same reason
 * DuelLayout does: the socket outlives navigation instead of being rebuilt.
 * loungeId is the second path segment (/lounge/ID).
 */
function LoungeLayout() {
  const { pathname } = useLocation()
  const loungeId = pathname.split('/')[2] ?? null

  const topics = useMemo(() => (loungeId ? [
    `/topic/lounge/${loungeId}`,
    // Per-user channel: state snapshots on resync, and the refusal when you're
    // not a friend of the host.
    '/user/queue/lounge',
  ] : []), [loungeId])

  const syncBody = useMemo(() => ({ loungeId }), [loungeId])

  return (
    <ProtectedRoute>
      <RoomSocketProvider topics={topics} syncDestination="/app/lounge/sync" syncBody={syncBody}>
        <Outlet />
      </RoomSocketProvider>
    </ProtectedRoute>
  )
}

export default LoungeLayout
