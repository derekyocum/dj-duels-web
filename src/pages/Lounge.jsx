import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import AppNav from '../components/AppNav'
import Footer from '../components/Footer'
import LoungeQueue from '../components/LoungeQueue'
import NowPlaying from '../components/NowPlaying'
import LoungeAvatar from '../components/LoungeAvatar'
import { useRoomSocket, useRoomEvents } from '../context/RoomSocketContext'
import { useAuth } from '../context/AuthContext'

/**
 * A friends-only room where everyone hears the same moment of the same track.
 *
 * Playback position is never sent over the wire as a number that ticks — the
 * server sends {@code startedAt} plus its own clock, and this page derives the
 * offset once. That's what lets a late joiner drop into the middle of a song
 * instead of restarting it for everyone.
 *
 * Cozy, not competitive: warm ember accents, slow ambient motion, and no
 * timers counting down at anyone.
 */
function Lounge() {
  const { loungeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { send, isConnected } = useRoomSocket()

  const [state, setState] = useState(null)
  const [denied, setDenied] = useState(null)
  // Server clock minus ours at the moment of the last snapshot. Applied when
  // computing playback position so a client whose clock is off doesn't seek to
  // the wrong place -- the duel Stage relies on the same idea via songEndsAt.
  // State rather than a ref because it's genuinely rendered (it shifts the
  // progress bar), and refs must not be read during render.
  const [clockOffset, setClockOffset] = useState(0)

  const handleEvent = useCallback((event) => {
    if (event.type === 'LOUNGE_STATE') {
      const payload = event.payload
      if (payload.serverNow) setClockOffset(payload.serverNow - Date.now())
      setState(payload)
    } else if (event.type === 'LOUNGE_DENIED') {
      setDenied(event.payload?.reason ?? 'friends_only')
    } else if (event.type === 'SESSION_EXPIRED' || event.type === 'AUTH_EXPIRED') {
      navigate('/')
    }
  }, [navigate])

  useRoomEvents(handleEvent)

  // Join on connect (and re-join after a reconnect -- the server treats a
  // repeat join from the same user as idempotent).
  useEffect(() => {
    if (isConnected) send('lounge/join', { loungeId })
  }, [isConnected, send, loungeId])

  // Leaving is explicit so the roster updates immediately for everyone else;
  // the room itself survives (see LoungeService's empty-grace window).
  useEffect(() => () => send('lounge/leave', { loungeId }), [send, loungeId])

  const handleAddTrack = useCallback((track) => {
    send('lounge/queue/add', {
      loungeId,
      track,
      // Full song length -- the lounge plays whole tracks, and the server needs
      // this to know when to advance. 0 means unknown; the server substitutes a
      // fallback rather than stalling.
      durationMs: track.durationMs ?? 0,
    })
  }, [send, loungeId])

  const handleRemove = useCallback((queuedTrackId) => {
    send('lounge/queue/remove', { loungeId, queuedTrackId })
  }, [send, loungeId])

  const handleSkipVote = useCallback(() => {
    send('lounge/skip-vote', { loungeId })
  }, [send, loungeId])

  if (denied) {
    return (
      <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-ember-deep via-midnight to-midnight">
        <AppNav />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-5xl mb-4">🚪</span>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {denied === 'full' ? 'This lounge is full' : 'This lounge is friends only'}
          </h1>
          <p className="text-text-secondary text-sm max-w-sm mb-6">
            {denied === 'full'
              ? 'Try again once someone heads out.'
              : 'You need to be friends with whoever started it. Send them a friend request and ask them to accept.'}
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-2.5 text-sm font-semibold rounded-full bg-ember/15 text-ember border border-ember/30 hover:bg-ember/25 transition-colors cursor-pointer"
          >
            Go to friends
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  const members = state?.members ?? []
  const isHost = state?.host === user?.username

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-ember-deep via-midnight to-midnight">
      {/* Slow, warm ambient wash -- transform/opacity only, no blur filter
          (same performance rule AppBackground's comments establish). */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full animate-breathe-slow"
             style={{ background: 'radial-gradient(circle, rgba(255,157,92,0.13) 0%, rgba(255,157,92,0.04) 45%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full animate-breathe"
             style={{ background: 'radial-gradient(circle, rgba(139,47,232,0.10) 0%, transparent 65%)' }} />
      </div>

      <AppNav right={
        <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-ember/10 text-ember border border-ember/25">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-ember' : 'bg-text-muted'}`} />
          {loungeId}
        </span>
      } />

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 pb-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">Listening Lounge</h1>
            <p className="text-text-secondary text-sm mt-1">
              {isHost ? 'Your room — share the code with friends.' : `${state?.host ?? '…'}'s room`}
            </p>
          </div>

          {/* Who's here — side by side, like people gathered in one room. The
              live dot on each avatar (see LoungeAvatar) is what sells "someone
              is actually here with you" rather than just a static list. */}
          <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-4 mb-8">
            {members.map((m) => (
              <div key={m} className="relative">
                {m === state?.host && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm" aria-label="Host" title="Host">
                    👑
                  </span>
                )}
                <LoungeAvatar username={m} present showName />
              </div>
            ))}
            {members.length === 0 && (
              <span className="text-text-muted text-sm">Settling in…</span>
            )}
          </div>

          <NowPlaying
            current={state?.current}
            startedAt={state?.startedAt}
            clockOffset={clockOffset}
            skipVotes={state?.skipVotes ?? 0}
            skipVotesRequired={state?.skipVotesRequired ?? 1}
            onSkipVote={handleSkipVote}
          />

          <LoungeQueue
            queue={state?.queue ?? []}
            onAdd={handleAddTrack}
            onRemove={handleRemove}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Lounge
