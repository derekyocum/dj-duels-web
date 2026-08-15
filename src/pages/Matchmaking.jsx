import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppBackground from '../components/AppBackground'
import AppNav from '../components/AppNav'
import Footer from '../components/Footer'
import { joinMatchmaking, matchmakingStatus, cancelMatchmaking } from '../utils/api'

const POLL_MS = 2000
// The backend forms groups of exactly 5 -- see MatchmakingService.GROUP_SIZE.
const GROUP_SIZE = 5
const VALID_MODES = new Set(['duel', 'lounge'])

function Matchmaking() {
  const navigate = useNavigate()
  const { mode } = useParams()
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

  // A bad/missing URL (no picker screen exists to redirect back to) just
  // bounces home rather than trying to queue for a mode that doesn't exist.
  useEffect(() => {
    if (!VALID_MODES.has(mode)) navigate('/', { replace: true })
  }, [mode, navigate])

  useEffect(() => {
    if (!VALID_MODES.has(mode)) return undefined
    activeRef.current = true
    let pollId = null

    const poll = async () => {
      try {
        const result = await matchmakingStatus()
        if (!activeRef.current) return
        if (result.status === 'matched') {
          matchedRef.current = true
          clearInterval(pollId)
          // No capacity in the URL: lobbies/lounges are open now, and a
          // matchmade duel auto-starts as soon as all five queued players
          // have joined.
          navigate(result.mode === 'lounge' ? `/lounge/${result.roomId}` : `/lobby/${result.roomId}`, { replace: true })
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

    joinMatchmaking(mode)
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
  }, [navigate, mode, attempt])

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

      <AppNav />

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
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              {mode === 'lounge' ? 'Finding you a lounge...' : 'Finding you a duel...'}
            </h2>
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
