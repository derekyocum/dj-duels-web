import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, sessionExpired } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    // sessionExpired is set by AuthContext.logoutSessionExpired() -- this is
    // the ONLY place that redirects on auth loss, so there's no race between
    // separately-triggered navigations landing in the wrong order.
    const state = sessionExpired
      ? { sessionExpired: true }
      : { from: location.pathname + location.search }
    return <Navigate to="/login" state={state} replace />
  }
  return children
}

export default ProtectedRoute
