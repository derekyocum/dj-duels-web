import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { reserveDuelCode } from '../utils/api'

/**
 * Create or join a private Duel lobby in one modal. Mirrors LoungeModal's
 * shell (start button, separator, join-by-code form) in the Duel's blue/
 * purple accent instead of the Lounge's ember, replacing the separate
 * CreateDuelModal/JoinDuelModal pair that used to sit behind Landing's Duel
 * card as two different buttons.
 *
 * The pre-navigation "here's your link, copy it" step CreateDuelModal used to
 * have isn't missed: Lobby.jsx already has its own copy-code and copy-link
 * controls once you're inside, the same thing Lounge's flow already relies on
 * (LoungeModal has never shown a link before navigating either).
 */
function PrivateDuelModal({ isOpen, onClose }) {
  const [code, setCode] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  if (!isOpen && code) {
    setCode('')
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const start = async () => {
    setStarting(true)
    setError(null)
    try {
      const duelId = await reserveDuelCode()
      navigate(`/lobby/${duelId}?host=true`)
    } catch (e) {
      setError(e.message)
      setStarting(false)
    }
  }

  const join = (e) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length === 6) navigate(`/lobby/${trimmed}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onClick={onClose}>
      <div
        className="bg-dark-surface border border-neon-blue/25 rounded-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-xl font-bold text-text-primary mb-1">Duel</h2>
        <p className="text-text-secondary text-sm mb-6">
          Battle 1v1 with friends — pick tracks, the room votes, and the last DJ standing wins.
        </p>

        <button
          onClick={start}
          disabled={starting}
          className="w-full py-3 text-sm font-bold rounded-full bg-neon-blue text-white hover:-translate-y-0.5 transition-transform duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {starting ? 'Starting…' : 'Start a duel'}
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
            className="flex-1 min-w-0 bg-card border border-text-muted/20 text-text-primary rounded-lg px-4 py-2.5 text-sm tracking-widest placeholder:tracking-normal placeholder:text-text-muted focus:outline-none focus:border-neon-blue/50 transition-colors"
          />
          <button
            type="submit"
            disabled={code.trim().length !== 6}
            className="shrink-0 px-5 py-2.5 text-sm font-semibold rounded-lg bg-neon-blue/15 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  )
}

export default PrivateDuelModal
