import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'

function JoinDuelModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!isOpen) setCode('')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleJoin = useCallback(() => {
    if (code.length !== 6) return
    onClose()
    navigate(`/lobby/${code}`)
  }, [code, navigate, onClose])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleJoin()
  }, [handleJoin])

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

        <h2 className="text-xl font-bold text-text-primary mb-2">Join a Duel</h2>
        <p className="text-text-secondary text-sm mb-5">Enter the 6-character duel code from your friend</p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          onKeyDown={handleKeyDown}
          maxLength={6}
          placeholder="Enter duel code"
          autoFocus
          className="w-full bg-card border border-text-muted/30 text-text-primary rounded-lg px-4 py-3 text-center text-xl font-mono tracking-widest placeholder:text-text-muted/50 placeholder:text-base placeholder:tracking-normal focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none mb-6 transition-colors"
        />

        <button
          onClick={handleJoin}
          disabled={code.length !== 6}
          className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Join
        </button>
      </div>
    </div>
  )
}

export default JoinDuelModal
