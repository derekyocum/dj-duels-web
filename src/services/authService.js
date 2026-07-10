const API_BASE = 'http://localhost:8080'
const USER_KEY = 'dj_duels_user'

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function signup(username, email, password) {
  if (!username || !email || !password) throw new Error('All fields are required')
  if (password.length < 8) throw new Error('Password must be at least 8 characters')
  await post('/api/auth/signup', { username, email, password })
}

export async function confirmSignup(username, code) {
  await post('/api/auth/confirm', { username, code })
}

export async function login(username, password) {
  if (!username || !password) throw new Error('Username and password are required')
  const data = await post('/api/auth/login', { username, password })
  const user = { username: data.username, email: data.email, accessToken: data.accessToken }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function logout() {
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
