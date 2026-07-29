import { useState } from 'react'
import { useNavigate } from 'react-router'
import AppBackground from '../components/AppBackground'
import AppNav from '../components/AppNav'
import CreateDuelModal from '../components/CreateDuelModal'
import JoinDuelModal from '../components/JoinDuelModal'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

function Landing() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

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

  return (
    <div className="relative min-h-svh flex flex-col">
      <AppBackground />

      <AppNav />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
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

        <div className="flex flex-col sm:flex-row gap-4">
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

        <button
          onClick={handleFindMatchClick}
          className="mt-4 px-6 py-2.5 text-sm font-semibold rounded-full glass hover:glass-hover text-neon-purple hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          Find a Match
        </button>
        <p className="text-text-muted text-xs mt-2">No code needed — we&apos;ll pair you with 3 other players</p>

        <div className="mt-16 flex items-center gap-8 text-text-muted text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-text-primary">1v1</span>
            <span className="uppercase tracking-wider text-xs">Rounds</span>
          </div>
          <div className="w-px h-8 bg-text-muted/20" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-text-primary">Up to 7</span>
            <span className="uppercase tracking-wider text-xs">Players</span>
          </div>
          <div className="w-px h-8 bg-text-muted/20" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-text-primary">Vote</span>
            <span className="uppercase tracking-wider text-xs">To Win</span>
          </div>
        </div>
      </main>

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            How it <span className="text-neon-blue">works</span>
          </h2>
          <p className="text-text-secondary text-lg">Three steps to prove you&apos;ve got the best taste</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🎯', ring: 'bg-neon-blue/15 border-neon-blue/30', title: 'Create a Duel', body: 'Pick your player count, grab the invite link, and send it to your crew.' },
            { icon: '⚔️', ring: 'bg-neon-pink/15 border-neon-pink/30', title: 'Battle 1v1', body: 'Go head-to-head each round. Pick your best track and let it ride.' },
            { icon: '👑', ring: 'bg-neon-purple/15 border-neon-purple/30', title: 'Claim the Crown', body: 'Friends vote on the winner each round. Last one standing takes the crown.' },
          ].map((s) => (
            <div key={s.title} className="glass hover:glass-hover rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-2xl border ${s.ring} flex items-center justify-center mx-auto mb-5`}>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <CreateDuelModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinDuelModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  )
}

export default Landing
