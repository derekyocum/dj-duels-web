import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { generateDuelId } from '../utils/duelUtils'
import { MAX_PLAYERS } from '../utils/lobbyRules'

// One step now: a lobby has no capacity to choose up front. It's open from 2 up
// to MAX_PLAYERS, so the old "How many players?" screen was asking the host to
// commit to a number that no longer means anything -- and locking out a 5th
// friend who showed up late.
function CreateDuelModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [duelId, setDuelId] = useState(null)
  const [copied, setCopied] = useState(false)

  // A fresh code per opening, so reopening the modal never shares a stale link.
  // Adjusted during render rather than in an effect (React's "derive state from
  // props" pattern) -- an effect here would be a cascading extra render, and the
  // lint rule rightly flags it.
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setDuelId(generateDuelId())
      setCopied(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const lobbyLink = duelId ? `${window.location.origin}/lobby/${duelId}` : ''

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(lobbyLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [lobbyLink])

  const handleGoToLobby = useCallback(() => {
    onClose()
    navigate(`/lobby/${duelId}?host=true`)
  }, [navigate, duelId, onClose])

  if (!isOpen || !duelId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-surface border border-card rounded-2xl p-8 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-text-primary mb-2">Invite your friends</h2>
        <p className="text-text-secondary text-sm mb-5">
          Share this link — anyone who joins is in, up to {MAX_PLAYERS} players.
        </p>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 bg-midnight/80 border border-text-muted/20 rounded-lg px-4 py-2.5 text-text-muted text-sm font-mono truncate">
            {lobbyLink}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-4 py-2.5 text-sm font-semibold rounded-lg bg-neon-blue/15 text-neon-blue hover:bg-neon-blue/25 border border-neon-blue/30 transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <button
          onClick={handleGoToLobby}
          className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(0,128,255,0.3)]"
        >
          Go to Lobby
        </button>
      </div>
    </div>
  )
}

export default CreateDuelModal
