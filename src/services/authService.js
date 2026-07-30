const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const USER_KEY = 'dj_duels_user'

function friendlyError(status) {
  if (status === 429) return 'Too many attempts — please wait a moment and try again.'
  if (status === 401) return 'Session expired. Please log in again.'
  if (status === 403) return 'Access denied.'
  if (status >= 500) return 'Server error — please try again in a moment.'
  return `Unexpected error (${status}).`
}

// Errors carry `transient` so callers can tell "the server didn't answer" apart
// from "the server said no". refreshAccessToken depends on that distinction:
// treating a dropped connection as a dead login is what used to sign people out
// mid-game.
function requestError(message, { status, transient }) {
  const err = new Error(message)
  err.status = status
  err.transient = transient
  return err
}

async function post(path, body) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw requestError('Cannot reach the server — check your connection.', { transient: true })
  }

  // 5xx is the server having a bad moment, not a verdict about the caller.
  const transient = res.status >= 500

  const isJson = res.headers.get('content-type')?.includes('application/json')
  if (!isJson) {
    throw requestError(friendlyError(res.status), { status: res.status, transient })
  }

  const data = await res.json()
  if (!res.ok) {
    throw requestError(data.error || friendlyError(res.status), { status: res.status, transient })
  }
  return data
}

export async function forgotPassword(username) {
  if (!username) throw new Error('Username is required')
  await post('/api/auth/forgot-password', { username })
}

export async function resetPassword(username, code, newPassword) {
  await post('/api/auth/reset-password', { username, code, newPassword })
}

export async function signup(username, email, password) {
  if (!username || !email || !password) throw new Error('All fields are required')
  if (password.length < 8) throw new Error('Password must be at least 8 characters')
  await post('/api/auth/signup', { username, email, password })
}

export async function confirmSignup(username, code) {
  await post('/api/auth/confirm', { username, code })
}

export async function resendConfirmation(username) {
  await post('/api/auth/resend-confirmation', { username })
}

export async function login(username, password) {
  if (!username || !password) throw new Error('Username and password are required')
  const data = await post('/api/auth/login', { username, password })
  const user = {
    username: data.username,
    email: data.email,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + data.expiresIn * 1000,
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

/**
 * Outcomes of a refresh attempt. The middle one is the important one: a refresh
 * can fail without the login being dead, and the two must not be conflated.
 * Previously ANY failure wiped stored credentials, so one unreachable-server
 * moment — a flaky network, a backend restart, a 5xx — logged the user out and
 * surfaced as "Session expired" mid-game even though their token had ~45 minutes
 * left on it.
 */
export const REFRESH_OK = 'ok'
export const REFRESH_RETRY = 'retry'    // couldn't reach the server; creds untouched
export const REFRESH_EXPIRED = 'expired' // refresh token genuinely rejected; creds cleared

// Deduplicated: concurrent callers (the proactive AuthContext timer and the
// DuelSocketContext reactive path can both fire around the same moment) share
// one in-flight request instead of racing separate ones.
let refreshInFlight = null

export async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const user = getCurrentUser()
    // Nothing to refresh with -- only a fresh login recovers from this.
    if (!user?.refreshToken) return REFRESH_EXPIRED
    try {
      const data = await post('/api/auth/refresh', { username: user.username, refreshToken: user.refreshToken })
      const updated = { ...user, accessToken: data.accessToken, expiresAt: Date.now() + data.expiresIn * 1000 }
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
      return REFRESH_OK
    } catch (err) {
      if (err?.transient) {
        // The server never gave a verdict, so we don't get to conclude the login
        // is dead. Keep the credentials and let the caller retry.
        return REFRESH_RETRY
      }
      // A real rejection (4xx): the refresh token is invalid/expired/revoked.
      localStorage.removeItem(USER_KEY)
      return REFRESH_EXPIRED
    }
  })()
  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

export async function logout() {
  const user = getCurrentUser()
  if (user?.accessToken) {
    try {
      await fetch(`${API_BASE}/api/auth/signout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
    } catch { /* best effort — clear locally regardless */ }
  }
  localStorage.removeItem(USER_KEY)
}

// Unlike logout(), this is NOT best-effort — a failed deletion (e.g. an
// expired session) must surface to the caller instead of silently clearing
// local state and looking like it succeeded.
export async function deleteAccount() {
  const user = getCurrentUser()
  if (!user?.accessToken) throw new Error('Not signed in')

  let res
  try {
    res = await fetch(`${API_BASE}/api/auth/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
  } catch {
    throw new Error('Cannot reach the server — check your connection.')
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null
  if (!res.ok) throw new Error(data?.error || friendlyError(res.status))
  localStorage.removeItem(USER_KEY)
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
