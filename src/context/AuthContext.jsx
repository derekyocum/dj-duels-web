import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  refreshAccessToken,
} from '../services/authService'

const AuthContext = createContext(null)

// Refresh this long before the access token's actual expiry, so normal active
// use never actually hits the wall.
const REFRESH_BUFFER_MS = 5 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser())
  const [sessionExpired, setSessionExpired] = useState(false)

  const login = useCallback(async (username, password) => {
    const u = await authLogin(username, password)
    setSessionExpired(false)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
    setSessionExpired(false)
    setUser(null)
  }, [])

  // Used when the socket/token layer detects an unrecoverable auth failure
  // (e.g. a failed refresh). Unlike logout(), this clears the user
  // synchronously in one tick instead of awaiting a best-effort sign-out
  // network call first -- ProtectedRoute reacts to isAuthenticated flipping
  // false and does the actual redirect itself, reading sessionExpired to pick
  // the right banner. Routing this through ProtectedRoute (the single place
  // that redirects on auth loss) instead of also calling navigate() here
  // avoids a race between two competing redirects landing in the wrong order.
  const logoutSessionExpired = useCallback(() => {
    authLogout()
    setSessionExpired(true)
    setUser(null)
  }, [])

  // Proactively refresh ~5 min before each 60-min access token expiry, then
  // re-arm via the new expiresAt on success -- keeps an active session alive
  // indefinitely as long as the refresh token (30 days) is still valid.
  // No-ops for a session from before this feature shipped (no expiresAt yet);
  // that session just gets one final normal re-login, then is on this flow.
  useEffect(() => {
    if (!user?.expiresAt) return
    const delay = Math.max(0, user.expiresAt - Date.now() - REFRESH_BUFFER_MS)
    const t = setTimeout(async () => {
      const ok = await refreshAccessToken()
      if (!ok) setSessionExpired(true)
      setUser(ok ? getCurrentUser() : null)
    }, delay)
    return () => clearTimeout(t)
  }, [user?.expiresAt])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, logoutSessionExpired, sessionExpired, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
