const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const USER_KEY = 'dj_duels_user'

function friendlyError(status) {
  if (status === 429) return 'Too many attempts — please wait a moment and try again.'
  if (status === 401) return 'Session expired. Please log in again.'
  if (status === 403) return 'Access denied.'
  if (status >= 500) return 'Server error — please try again in a moment.'
  return `Unexpected error (${status}).`
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
    throw new Error('Cannot reach the server — check your connection.')
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  if (!isJson) {
    throw new Error(friendlyError(res.status))
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || friendlyError(res.status))
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

// Deduplicated: concurrent callers (the proactive AuthContext timer and the
// DuelSocketContext reactive path can both fire around the same moment) share
// one in-flight request instead of racing separate ones.
let refreshInFlight = null

export async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const user = getCurrentUser()
    if (!user?.refreshToken) return false
    try {
      const data = await post('/api/auth/refresh', { username: user.username, refreshToken: user.refreshToken })
      const updated = { ...user, accessToken: data.accessToken, expiresAt: Date.now() + data.expiresIn * 1000 }
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
      return true
    } catch {
      // The refresh token itself is invalid/expired/revoked -- no recovering
      // from this short of a fresh login.
      localStorage.removeItem(USER_KEY)
      return false
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

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
