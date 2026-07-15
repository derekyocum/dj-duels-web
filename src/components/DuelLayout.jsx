import { Outlet, useLocation } from 'react-router'
import ProtectedRoute from './ProtectedRoute'
import DuelResync from './DuelResync'
import { DuelSocketProvider } from '../context/DuelSocketContext'

// The lobby (/lobby/:duelId) and the in-duel pages (/duel/:duelId/...) share a
// single STOMP connection. They live under this one pathless layout route so
// navigating between them keeps the provider — and its socket — mounted, instead
// of tearing it down and dropping broadcasts in the reconnect window. duelId is
// the third path segment for both URL shapes (/lobby/ID and /duel/ID/...).
function DuelLayout() {
  const { pathname } = useLocation()
  const duelId = pathname.split('/')[2] ?? null

  return (
    <ProtectedRoute>
      <DuelSocketProvider duelId={duelId}>
        <DuelResync duelId={duelId} />
        <Outlet />
      </DuelSocketProvider>
    </ProtectedRoute>
  )
}

export default DuelLayout
