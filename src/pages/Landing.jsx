import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import AppBackground from '../components/AppBackground'
import AppNav from '../components/AppNav'
import CreateDuelModal from '../components/CreateDuelModal'
import JoinDuelModal from '../components/JoinDuelModal'
import LoungeModal from '../components/LoungeModal'
import ModeInfoModal from '../components/ModeInfoModal'
import ChampionSpotlight from '../components/ChampionSpotlight'
import WinnersWall from '../components/WinnersWall'
import LandingFaq from '../components/LandingFaq'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { fetchChampion, fetchRecentTracks } from '../utils/api'

function Landing() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showLoungeModal, setShowLoungeModal] = useState(false)
  const [showModeInfo, setShowModeInfo] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Both are public reads that resolve to null/[] rather than throwing, and
  // both sections render nothing when empty -- so a slow or failed fetch just
  // leaves the page as it was rather than showing a broken shell.
  const [champion, setChampion] = useState(null)
  const [recentTracks, setRecentTracks] = useState([])

  useEffect(() => {
    let ignore = false
    fetchChampion().then((c) => { if (!ignore) setChampion(c) })
    // Deliberately over-fetches: WinnersWall collapses repeat wins of the same
    // song into one card, so asking for exactly a wall's worth would leave a
    // short wall as soon as anyone wins twice with the same track.
    fetchRecentTracks(30).then((t) => { if (!ignore) setRecentTracks(t) })
    return () => { ignore = true }
  }, [])

  // Signed-out users used to be able to pick a player count and see a
  // generated invite link before finally hitting the auth wall at the actual
  // lobby navigation (ProtectedRoute) -- wasted steps, and sharing a link for
  // a duel they can never join. Gate the modals themselves instead.
  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowCreateModal(true)
  }

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowJoinModal(true)
  }

  const handleFindMatchClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/matchmaking')
  }

  const handleLoungeClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowLoungeModal(true)
  }

  return (
    <div className="relative min-h-svh flex flex-col">
      <AppBackground />

      <AppNav />

      {/* Was flex-1 + justify-center: with real sections below, that stretched
          the hero to fill leftover height and left a dead gap before the
          showcase, which is what made everything under it look dropped on
          rather than composed. The hero is now its own block and the page
          flows from it. */}
      <main className="relative z-10 flex flex-col items-center px-6 text-center pt-16 pb-12">
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full glass text-neon-pink">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-glow-pulse" />
            Battle your friends
          </span>
        </div>

        {/* Hero headline with a soft neon glow bloom behind it -- the gradient's
            own long transparent falloff does the softening; no blur() filter
            (was blur-[60px], the single most expensive blur in the app --
            always on-screen here, and the direct cause of a remote
            playtester's reported scroll jank, along with the other blur()
            sites removed in this same pass). */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{ background: 'radial-gradient(70% 70% at 50% 50%, rgba(0,128,255,0.3), rgba(139,47,232,0.2) 35%, transparent 72%)' }}
          />
          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.03em] leading-[0.95] max-w-3xl">
            <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              Who&apos;s got AUX
            </span>
          </h1>
        </div>

        <p className="text-lg md:text-xl text-text-secondary max-w-xl mb-10 leading-relaxed">
          Go head-to-head with your friends in 1v1 music battles.
          Pick your tracks, let the crowd decide, and prove you&apos;ve got the best taste.
        </p>

        {/* Two rows, no explainer text under anything -- what each mode is now
            lives behind the single info icon below, so a first-time visitor
            sees actions rather than paragraphs. */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCreateClick}
            className="group relative px-8 py-3.5 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_30px_-4px_rgba(0,128,255,0.5)] hover:shadow-[0_0_45px_-2px_rgba(0,128,255,0.7)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Create a Duel
          </button>
          <button
            onClick={handleJoinClick}
            className="px-8 py-3.5 text-base font-bold rounded-full glass hover:glass-hover text-neon-blue hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Join a Duel
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleFindMatchClick}
            className="px-6 py-2.5 text-sm font-semibold rounded-full glass hover:glass-hover text-neon-purple hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Find a Match
          </button>
          <button
            onClick={handleLoungeClick}
            className="px-6 py-2.5 text-sm font-semibold rounded-full glass hover:glass-hover text-ember hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Listening Lounge
          </button>
        </div>

        {/* One icon for all three modes -- opens a single color-coded modal
            rather than repeating an info affordance next to every button. */}
        <button
          onClick={() => setShowModeInfo(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5" aria-hidden="true">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 9.2v4.4" strokeLinecap="round" />
            <circle cx="10" cy="6.3" r="0.95" fill="currentColor" stroke="none" />
          </svg>
          What&apos;s the difference?
        </button>

      </main>

      {/* Real state of the game, not claims about it. Grouped into ONE band
          with a shared width and a single top hairline, so the champion and
          the wall read as two parts of "here's what's happening" rather than
          two unrelated cards stacked down the page. Both still render nothing
          at all until there's something true to show. */}
      {(champion || recentTracks.length > 0) && (
        <section className="relative z-10">
          <div
            className="max-w-5xl mx-auto h-px"
            aria-hidden="true"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }}
          />
          <div className="py-10">
            <WinnersWall tracks={recentTracks} />
            <ChampionSpotlight champion={champion} />
          </div>
        </section>
      )}

      <LandingFaq />

      <Footer />

      <CreateDuelModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinDuelModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
      <LoungeModal isOpen={showLoungeModal} onClose={() => setShowLoungeModal(false)} />
      <ModeInfoModal isOpen={showModeInfo} onClose={() => setShowModeInfo(false)} />
    </div>
  )
}

export default Landing
