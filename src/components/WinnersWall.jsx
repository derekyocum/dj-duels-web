import { useState } from 'react'
import { useNavigate } from 'react-router'
import { fireTrack } from '../utils/api'
import { useAuth } from '../context/AuthContext'

// Below this the strip reads as a broken or abandoned feature rather than a
// wall, so the whole section hides itself instead. Raise it once there's real
// traffic; the point is never to advertise emptiness.
const MIN_TRACKS = 3

function FireButton({ track, fired, onFire }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const count = track.fires + (fired ? 1 : 0)

  const handleClick = (e) => {
    e.preventDefault()
    // Signing in is the cost of voting -- the count only means anything because
    // it's one per real account (see MatchStore#fire).
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    onFire(track.matchId)
  }

  return (
    <button
      onClick={handleClick}
      disabled={fired}
      aria-label={fired ? 'You already gave this a fire' : 'Give this track a fire'}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-colors ${
        fired
          ? 'border-neon-orange/50 bg-neon-orange/15 text-neon-orange cursor-default'
          : 'border-text-muted/25 text-text-secondary hover:border-neon-orange/40 hover:text-neon-orange cursor-pointer'
      }`}
    >
      <span aria-hidden="true">🔥</span>
      <span className="tabular-nums">{count}</span>
    </button>
  )
}

function TrackCard({ track, fired, onFire }) {
  return (
    <div className="shrink-0 w-40">
      <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-card border border-text-muted/10">
        {track.albumArtUrl ? (
          <img src={track.albumArtUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
        )}
      </div>
      <p className="mt-2 text-text-primary text-sm font-semibold truncate">{track.trackName}</p>
      <p className="text-text-muted text-xs truncate mb-2">{track.artist}</p>
      <FireButton track={track} fired={fired} onFire={onFire} />
    </div>
  )
}

/**
 * A drifting strip of tracks that actually won a duel, each carrying a global
 * 🔥 count anyone signed in can add to (once).
 *
 * Deliberately anonymous: the server never sends who picked a track, so this
 * shows what the room liked without publishing anyone's listening habits to
 * the open internet.
 *
 * The list is rendered TWICE back to back -- that's what makes the marquee
 * loop seamlessly (see index.css). A fired state is tracked by matchId rather
 * than by position, so lighting one copy lights its twin too.
 */
function WinnersWall({ tracks }) {
  const [firedIds, setFiredIds] = useState(() => new Set())

  if (!tracks || tracks.length < MIN_TRACKS) return null

  const handleFire = async (matchId) => {
    // Optimistic: the count is a vanity number, and waiting on a round trip to
    // light the button makes it feel broken.
    setFiredIds((prev) => new Set(prev).add(matchId))
    try {
      await fireTrack(matchId)
    } catch (err) {
      // 'already_fired' means the server knows something this browser didn't
      // (fired from another device, or before a refresh) -- the button being
      // lit is the CORRECT end state, so leave it. Anything else is a real
      // failure and shouldn't leave a fake count on screen.
      if (err.code !== 'already_fired') {
        setFiredIds((prev) => {
          const next = new Set(prev)
          next.delete(matchId)
          return next
        })
      }
    }
  }

  return (
    <section className="relative z-10 py-16">
      <div className="max-w-4xl mx-auto text-center px-6 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
          Tracks that <span className="text-neon-orange">won</span>
        </h2>
        <p className="text-text-secondary text-lg">
          Real picks that beat someone. Hit 🔥 on the ones you&apos;d have voted for.
        </p>
      </div>

      {/* overflow-hidden clips the drift; the inner track is what animates.
          Masked at both edges so cards fade out instead of being guillotined. */}
      <div
        className="overflow-x-auto no-scrollbar"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}
      >
        <div className="flex gap-5 w-max px-6 animate-marquee">
          {[...tracks, ...tracks].map((track, i) => (
            <TrackCard
              key={`${track.matchId}-${i}`}
              track={track}
              fired={firedIds.has(track.matchId)}
              onFire={handleFire}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default WinnersWall
