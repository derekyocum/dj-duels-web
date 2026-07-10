import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const justConfirmed = location.state?.confirmed === true

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
    <div className="relative min-h-svh flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight px-6">
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <a href="/" className="flex items-center justify-center gap-2 no-underline mb-10">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>

        <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
          <p className="text-text-secondary text-sm mb-4">Sign in to your account</p>

          {justConfirmed && (
            <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-neon-green text-sm font-medium">Account confirmed — you're good to go!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="DJFire99"
                required
                className="w-full bg-midnight/80 border border-text-muted/20 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-midnight/80 border border-text-muted/20 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors"
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
              className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/signup" state={{ from }} className="text-neon-blue hover:text-neon-blue/80 font-semibold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
