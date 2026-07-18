import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import AppBackground from '../components/AppBackground'
import { signup, confirmSignup } from '../services/authService'

function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [step, setStep] = useState('form')
  const [pendingUsername, setPendingUsername] = useState('')

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await signup(username.trim(), email, password)
      setPendingUsername(username.trim())
      setStep('confirm')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await confirmSignup(pendingUsername, code.trim())
      navigate('/login', { state: { confirmed: true, from } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sharedInputClass = "w-full bg-midnight/80 border border-text-muted/20 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors"
  const labelClass = "block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5"

  return (
    <div className="relative min-h-svh flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight px-6">
      <AppBackground />

      <div className="relative z-10 w-full max-w-sm">
        <a href="/" className="flex items-center justify-center gap-2 no-underline mb-10">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>

        {step === 'form' ? (
          <>
            <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-text-primary mb-1">Create account</h1>
              <p className="text-text-secondary text-sm mb-6">Join the battle</p>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className={labelClass}>Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="DJFire99" required className={sharedInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required className={sharedInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" required className={sharedInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••" required className={sharedInputClass} />
                </div>

                {error && (
                  <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3">
                    <p className="text-neon-pink text-sm">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(0,128,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </div>

            <p className="text-center text-text-secondary text-sm mt-4">
              Already have an account?{' '}
              <Link to="/login" state={{ from }} className="text-neon-blue hover:text-neon-blue/80 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
              <span className="text-3xl block mb-3">📧</span>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Check your email</h1>
              <p className="text-text-secondary text-sm">
                We sent a confirmation code to <span className="text-text-primary font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className={labelClass}>Confirmation Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className={`${sharedInputClass} text-center tracking-[0.4em] text-lg font-mono`}
                />
              </div>

              {error && (
                <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3">
                  <p className="text-neon-pink text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(0,128,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {loading ? 'Verifying...' : 'Confirm Account'}
              </button>

              <button type="button" onClick={() => { setStep('form'); setError(null) }}
                className="w-full py-2 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
                ← Back
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Signup
