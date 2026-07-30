import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  login as authLogin,
  logout as authLogout,
  deleteAccount as authDeleteAccount,
  getCurrentUser,
  refreshAccessToken,
  REFRESH_OK,
  REFRESH_EXPIRED,
} from '../services/authService'

const AuthContext = createContext(null)

// Refresh this long before the access token's actual expiry, so normal active
// use never actually hits the wall.
const REFRESH_BUFFER_MS = 5 * 60 * 1000

// How long to wait before trying again after a refresh that didn't get a
// verdict from the server (dropped connection, 5xx, backend restart). Short
// enough that a real network blip mid-session self-heals well before the
// access token's ~55 remaining minutes run out.
const RETRY_DELAY_MS = 30 * 1000

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

  // Unlike logout, lets a failure (e.g. an expired session) propagate to the
  // caller instead of swallowing it -- the page needs to know deletion didn't
  // actually happen so it can tell the user, not just clear state.
  const deleteAccount = useCallback(async () => {
    await authDeleteAccount()
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
  //
  // A refresh that fails without a verdict (dropped connection, backend 5xx)
  // must NOT be treated as a dead login -- that was the actual bug behind
  // sessions getting kicked mid-duel well before the real ~60min expiry: any
  // transient failure wiped stored credentials and forced a logout. Now only
  // REFRESH_EXPIRED (the server explicitly rejected the refresh token) does
  // that; anything else just retries shortly.
  useEffect(() => {
    if (!user?.expiresAt) return
    let cancelled = false
    let timeoutId

    const attempt = async () => {
      const result = await refreshAccessToken()
      if (cancelled) return
      if (result === REFRESH_OK) {
        setUser(getCurrentUser()) // re-arms this effect via the new expiresAt
      } else if (result === REFRESH_EXPIRED) {
        setSessionExpired(true)
        setUser(null)
      } else {
        timeoutId = setTimeout(attempt, RETRY_DELAY_MS)
      }
    }

    const initialDelay = Math.max(0, user.expiresAt - Date.now() - REFRESH_BUFFER_MS)
    timeoutId = setTimeout(attempt, initialDelay)
    return () => { cancelled = true; clearTimeout(timeoutId) }
  }, [user?.expiresAt])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, deleteAccount, logoutSessionExpired, sessionExpired, isAuthenticated: !!user }}
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
