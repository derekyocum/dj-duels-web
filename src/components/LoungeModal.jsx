import { useState } from 'react'
import { useNavigate } from 'react-router'
import { reserveLoungeCode } from '../utils/api'

/**
 * Start or join a Listening Lounge. Mirrors CreateDuelModal/JoinDuelModal's
 * shell so it reads as part of the same app, with the lounge's warmer accent.
 *
 * Access is friends-only and enforced on the server, so this doesn't need to
 * check anything — a code alone won't get a stranger in.
 */
function LoungeModal({ isOpen, onClose }) {
  const [code, setCode] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  if (!isOpen) return null

  const start = async () => {
    setStarting(true)
    setError(null)
    try {
      const loungeId = await reserveLoungeCode()
      navigate(`/lounge/${loungeId}`)
    } catch (e) {
      setError(e.message)
      setStarting(false)
    }
  }

  const join = (e) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length === 6) navigate(`/lounge/${trimmed}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onClick={onClose}>
      <div
        className="bg-dark-surface border border-ember/25 rounded-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-xl font-bold text-text-primary mb-1">Listening Lounge</h2>
        <p className="text-text-secondary text-sm mb-6">
          Put on music with friends and just hang out. No rounds, no timer — it runs as long as you want.
        </p>

        <button
          onClick={start}
          disabled={starting}
          className="w-full py-3 text-sm font-bold rounded-full bg-gradient-to-r from-ember to-neon-purple text-white hover:-translate-y-0.5 transition-transform duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {starting ? 'Starting…' : 'Start a lounge'}
        </button>
        {error && <p className="text-neon-pink text-xs mt-2 text-center">{error}</p>}

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-text-muted/15" />
          <span className="text-text-muted text-xs">or join one</span>
          <div className="flex-1 h-px bg-text-muted/15" />
        </div>

        <form onSubmit={join} className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect="off"
            className="flex-1 min-w-0 bg-card border border-text-muted/20 text-text-primary rounded-lg px-4 py-2.5 text-sm tracking-widest placeholder:tracking-normal placeholder:text-text-muted focus:outline-none focus:border-ember/50 transition-colors"
          />
          <button
            type="submit"
            disabled={code.trim().length !== 6}
            className="shrink-0 px-5 py-2.5 text-sm font-semibold rounded-lg bg-ember/15 text-ember border border-ember/30 hover:bg-ember/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </form>

        <p className="text-text-muted text-xs mt-4">
          You can only join a friend&apos;s lounge — add them on your profile first.
        </p>
      </div>
    </div>
  )
}

export default LoungeModal
