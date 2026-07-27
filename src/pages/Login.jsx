import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import AppBackground from '../components/AppBackground'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const inputClass = "w-full bg-black/30 border border-white/10 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue/70 focus:ring-2 focus:ring-neon-blue/25 focus:outline-none transition-colors"
const labelClass = "block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5"

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const justConfirmed = location.state?.confirmed === true
  const justReset = location.state?.passwordReset === true
  const sessionExpired = location.state?.sessionExpired === true

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh flex flex-col items-center justify-center px-6">
      <AppBackground />

      <div className="relative z-10 w-full max-w-sm">
        <a href="/" className="flex items-center justify-center gap-2 no-underline mb-10">
          <Logo className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
          <p className="text-text-secondary text-sm mb-4">Sign in to your account</p>

          {justConfirmed && (
            <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-neon-green text-sm font-medium">Account confirmed — you&apos;re good to go!</p>
            </div>
          )}
          {justReset && (
            <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-neon-green text-sm font-medium">Password reset — sign in with your new password.</p>
            </div>
          )}
          {sessionExpired && (
            <div className="bg-neon-yellow/10 border border-neon-yellow/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-neon-yellow text-sm font-medium">Your session expired — please sign in again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="DJFire99"
                required
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </div>

            {error && (
              <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3">
                <p className="text-neon-pink text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_30px_-6px_rgba(0,128,255,0.5)] transition-all duration-300 cursor-pointer hover:shadow-[0_0_40px_-4px_rgba(0,128,255,0.7)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" state={{ from }} className="text-neon-blue hover:text-neon-blue/80 font-semibold transition-colors">
            Sign up
          </Link>
        </p>

        <Footer className="mt-8 py-0" />
      </div>
    </div>
  )
}

export default Login
