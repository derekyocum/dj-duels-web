import { createContext, useContext, useState, useCallback } from 'react'
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser())

  const login = useCallback(async (username, password) => {
    const u = await authLogin(username, password)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
