import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { generateDuelId } from '../utils/duelUtils'

const PLAYER_OPTIONS = [2, 3, 4, 5, 6, 7]

function CreateDuelModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [playerCount, setPlayerCount] = useState(null)
  const [duelId, setDuelId] = useState(null)
  const [copied, setCopied] = useState(false)

  const lobbyLink = duelId ? `${window.location.origin}/lobby/${duelId}` : ''

  if (!isOpen && (step !== 1 || playerCount || duelId || copied)) {
    setStep(1)
    setPlayerCount(null)
    setDuelId(null)
    setCopied(false)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleNext = useCallback(() => {
    if (!playerCount) return
    setDuelId(generateDuelId())
    setStep(2)
  }, [playerCount])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(lobbyLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [lobbyLink])

  const handleGoToLobby = useCallback(() => {
    onClose()
    navigate(`/lobby/${duelId}?host=true&players=${playerCount}`)
  }, [navigate, duelId, playerCount, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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

        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-text-primary mb-6">How many players?</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PLAYER_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`py-3 rounded-xl font-semibold text-lg transition-all duration-200 cursor-pointer ${
                    playerCount === n
                      ? 'bg-neon-blue/20 text-neon-blue border-2 border-neon-blue/50 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                      : 'bg-card hover:bg-card-hover text-text-secondary border-2 border-transparent'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={!playerCount}
              className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-text-primary mb-2">Invite your friends</h2>
            <p className="text-text-secondary text-sm mb-5">Share this link to invite {playerCount - 1} {playerCount === 2 ? 'friend' : 'friends'}</p>
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
              className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
            >
              Go to Lobby
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateDuelModal
