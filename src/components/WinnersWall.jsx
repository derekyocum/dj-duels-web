import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { fireTrack } from '../utils/api'
import { useAuth } from '../context/AuthContext'

// Below this the strip reads as a broken or abandoned feature rather than a
// wall, so the whole section hides itself instead. Raise it once there's real
// traffic; the point is never to advertise emptiness.
const MIN_TRACKS = 3
// w-40 card + gap-5. Only used to decide whether the strip is long enough to
// need looping -- an estimate is fine, and being slightly off just means the
// loop engages one card early or late.
const CARD_STRIDE_PX = 180

/**
 * One card per SONG, not per win.
 *
 * A track that wins several duels is several rows in dj-duels-matches, which
 * is correct as history but reads as a bug on a wall of covers -- the same
 * album twice in one glance looks like a rendering fault, not a popular song.
 * The list arrives newest-first, so keeping the first occurrence keeps the
 * most recent win (and its fire count) and drops the older ones.
 */
function dedupeBySong(tracks) {
  const seen = new Set()
  return tracks.filter((t) => {
    const key = `${(t.trackName ?? '').toLowerCase()}|${(t.artist ?? '').toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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
 * Only loops when there's actually enough to loop with. A seamless marquee
 * needs the list rendered twice back to back, which means every song is on
 * screen twice -- fine once the wall is long, but with a handful of tracks it
 * just looks like the same albums over and over. Below that threshold the
 * strip sits still and shows each song exactly once. Fired state is keyed by
 * matchId, not position, so lighting one copy lights its twin too.
 */
function WinnersWall({ tracks }) {
  const [firedIds, setFiredIds] = useState(() => new Set())
  const viewportRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(0)

  // One card per song, so a repeat winner doesn't read as a rendering fault.
  const songs = useMemo(() => dedupeBySong(tracks ?? []), [tracks])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => setViewportWidth(el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [songs.length])

  if (songs.length < MIN_TRACKS) return null

  // Duplicating is what makes the loop seamless, so only pay for it (in
  // visible repetition) once the strip genuinely overflows.
  const shouldLoop = viewportWidth > 0 && songs.length * CARD_STRIDE_PX > viewportWidth
  const rendered = shouldLoop ? [...songs, ...songs] : songs

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
      {/* Quiet section label rather than a headline -- the album art is the
          colour on this page, and a big bold heading above it was competing
          with the very thing it's introducing. Matches the FAQ's label so the
          two lower sections read as one calm register beneath the hero. */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-8">
        <p className="text-neon-orange/60 text-[11px] font-bold uppercase tracking-[0.24em] mb-2">
          Tracks that won
        </p>
        <p className="text-text-secondary/80 text-sm">
          Real picks that beat someone. Hit 🔥 on the ones you&apos;d have voted for.
        </p>
      </div>

      {/* Only the middle of the strip is in focus; everything drifting toward
          the edges softens out, so attention lands on the few cards nearest
          the centre. This only makes sense on a strip that's actually
          moving -- a short, static, centred row has no edges drifting out of
          view to soften, so the panels below are skipped entirely rather
          than fading empty background next to cards they no longer reach.

          The blur lives on TWO STATIC SIDE PANELS rather than on the cards.
          Blurring per-card would mean recomputing a filter for every card on
          every frame of the marquee -- exactly the cost this codebase already
          learned to avoid (see index.css's note on the removed blur() sites
          and the scroll jank they caused). Two fixed panels are a constant
          cost no matter how many tracks are on the wall, and the radius is
          kept low for the same reason. */}
      <div className="relative">
        <div
          ref={viewportRef}
          className="overflow-x-auto no-scrollbar"
          style={shouldLoop ? { maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' } : undefined}
        >
          {/* justify-center when it fits: a short, still strip should sit in
              the middle rather than hug the left edge under the centred label. */}
          <div className={`flex gap-5 px-6 ${shouldLoop ? 'w-max animate-marquee' : 'justify-center'}`}>
            {rendered.map((track, i) => (
              <TrackCard
                key={`${track.matchId}-${i}`}
                track={track}
                fired={firedIds.has(track.matchId)}
                onFire={handleFire}
              />
            ))}
          </div>
        </div>

        {/* pointer-events-none so the cards underneath stay tappable -- the
            🔥 buttons must not be swallowed by a decorative overlay. */}
        {shouldLoop && (
          <>
            <div
              className="absolute inset-y-0 left-0 w-[26%] pointer-events-none backdrop-blur-[3px]"
              aria-hidden="true"
              style={{ maskImage: 'linear-gradient(to right, black 35%, transparent)' }}
            />
            <div
              className="absolute inset-y-0 right-0 w-[26%] pointer-events-none backdrop-blur-[3px]"
              aria-hidden="true"
              style={{ maskImage: 'linear-gradient(to left, black 35%, transparent)' }}
            />
          </>
        )}
      </div>
    </section>
  )
}

export default WinnersWall
