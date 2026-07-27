import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import AppBackground from '../components/AppBackground'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { joinMatchmaking, matchmakingStatus, cancelMatchmaking } from '../utils/api'

const POLL_MS = 2000
// The backend forms groups of exactly 4 -- see MatchmakingService.GROUP_SIZE.
const GROUP_SIZE = 4

function Matchmaking() {
  const navigate = useNavigate()
  const [position, setPosition] = useState(null)
  const [timedOut, setTimedOut] = useState(false)
  const [error, setError] = useState(null)
  // Bumped by handleRetry to force the join+poll effect below to re-run --
  // its own state changes (timedOut/position) don't belong in that effect's
  // deps, since THIS is the one thing that should actually restart it.
  const [attempt, setAttempt] = useState(0)
  // Guards against a queued network response landing after the user already
  // clicked Cancel or navigated away (React Router unmounts this component,
  // but an in-flight fetch's .then() would otherwise still fire).
  const activeRef = useRef(true)
  const matchedRef = useRef(false)

  useEffect(() => {
    activeRef.current = true
    let pollId = null

    const poll = async () => {
      try {
        const result = await matchmakingStatus()
        if (!activeRef.current) return
        if (result.status === 'matched') {
          matchedRef.current = true
          clearInterval(pollId)
          // players=4: the server already knows the real group size (a
          // matchmade session's maxPlayers is set the moment it's formed), but
          // passing it here too avoids a one-frame "1 of 2" flash before the
          // server's PLAYER_JOINED broadcast corrects it.
          navigate(`/lobby/${result.duelId}?players=${GROUP_SIZE}`, { replace: true })
        } else if (result.status === 'not_queued') {
          clearInterval(pollId)
          setTimedOut(true)
        } else {
          setPosition(result.position)
        }
      } catch {
        // A transient poll failure isn't fatal -- just try again next tick.
      }
    }

    joinMatchmaking()
      .then(poll)
      .catch(() => { if (activeRef.current) setError('Could not start matchmaking. Please try again.') })
    pollId = setInterval(poll, POLL_MS)

    return () => {
      activeRef.current = false
      clearInterval(pollId)
      // Don't cancel the queue entry out from under a player who just got
      // matched and is navigating to their new lobby.
      if (!matchedRef.current) cancelMatchmaking().catch(() => {})
    }
  }, [navigate, attempt])

  const handleCancel = () => {
    matchedRef.current = false // ensure the cleanup effect actually cancels
    navigate('/')
  }

  const handleRetry = () => {
    setTimedOut(false)
    setPosition(null)
    setError(null)
    setAttempt((n) => n + 1) // re-runs the join+poll effect from scratch
  }

  return (
    <div className="relative min-h-svh flex flex-col">
      <AppBackground />

      <nav className="relative z-10 flex items-center px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <Logo className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-text-secondary">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 text-sm font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        ) : timedOut ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl">🎧</span>
            <h2 className="text-2xl font-bold text-text-primary">No match found yet</h2>
            <p className="text-text-secondary max-w-sm">
              Not enough players searching right now. Try again, or share the app with friends!
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 text-sm font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <span className="text-5xl animate-pulse">🎧</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Finding you a match...</h2>
            <p className="text-text-secondary">
              {position ? `${position} of ${GROUP_SIZE} in queue` : 'Connecting...'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <button
              onClick={handleCancel}
              className="mt-6 px-6 py-2.5 text-sm font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary hover:border-text-muted/50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Matchmaking
