import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AppBackground from '../components/AppBackground'
import Logo from '../components/Logo'
import { forgotPassword, resetPassword } from '../services/authService'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('request')
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleRequest = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPassword(username.trim())
      setStep('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await resetPassword(username.trim(), code.trim(), newPassword)
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-midnight/80 border border-text-muted/20 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors"
  const labelClass = "block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5"

  return (
    <div className="relative min-h-svh flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight px-6">
      <AppBackground />

      <div className="relative z-10 w-full max-w-sm">
        <a href="/" className="flex items-center justify-center gap-2 no-underline mb-10">
          <Logo className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>

        {step === 'request' ? (
          <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-text-primary mb-1">Reset password</h1>
            <p className="text-text-secondary text-sm mb-6">Enter your username and we'll send a reset code to your email.</p>

            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className={labelClass}>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="DJFire99" required className={inputClass} />
              </div>

              {error && (
                <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3">
                  <p className="text-neon-pink text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(0,128,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
              <span className="text-3xl block mb-3">🔑</span>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Check your email</h1>
              <p className="text-text-secondary text-sm">
                Enter the code sent to <span className="text-text-primary font-medium">{username}</span>'s account
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className={labelClass}>Reset Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code" maxLength={6} required
                  className={`${inputClass} text-center tracking-[0.4em] text-lg font-mono`} />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••" required className={inputClass} />
              </div>

              {error && (
                <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3">
                  <p className="text-neon-pink text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(0,128,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button type="button" onClick={() => { setStep('request'); setError(null) }}
                className="w-full py-2 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
                ← Back
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-text-secondary text-sm mt-4">
          <Link to="/login" className="text-neon-blue hover:text-neon-blue/80 font-semibold transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
