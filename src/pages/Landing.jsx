import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import CreateDuelModal from '../components/CreateDuelModal'
import JoinDuelModal from '../components/JoinDuelModal'
import { useAuth } from '../context/AuthContext'

function Landing() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-text-muted/20 hover:border-neon-blue/30 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center">
                <span className="text-neon-blue text-xs font-bold">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-text-secondary text-sm font-medium">{user.username}</span>
            </Link>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="px-4 py-1.5 text-sm font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary hover:border-text-muted/50 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-full text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 text-sm font-semibold rounded-full border border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-4">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-neon-pink/10 text-neon-pink border border-neon-pink/20">
            Battle your friends
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 max-w-3xl">
          <span className="bg-gradient-to-r from-[#7ab8cc] via-[#9b8fc4] to-[#c47a9e] bg-clip-text text-transparent">
            Who's got AUX
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-xl mb-10 leading-relaxed">
          Go head-to-head with your friends in 1v1 music battles.
          Pick your tracks, let the crowd decide, and prove you've got the best taste.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative px-8 py-3.5 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_50px_rgba(0,212,255,0.5)] transition-all duration-300 cursor-pointer"
          >
            Create a Duel
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-8 py-3.5 text-base font-bold rounded-full border-2 border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue/60 transition-all duration-300 cursor-pointer"
          >
            Join a Duel
          </button>
        </div>

        <div className="mt-16 flex items-center gap-8 text-text-muted text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-text-primary">1v1</span>
            <span>Rounds</span>
          </div>
          <div className="w-px h-8 bg-text-muted/30" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-text-primary">Up to 7</span>
            <span>Players</span>
          </div>
          <div className="w-px h-8 bg-text-muted/30" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-text-primary">Vote</span>
            <span>To Win</span>
          </div>
        </div>
      </main>

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            How it <span className="text-neon-blue">works</span>
          </h2>
          <p className="text-text-secondary text-lg">Three steps to prove you've got the best taste</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Create a Duel</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Pick your player count, grab the invite link, and send it to your crew.
            </p>
          </div>

          <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-neon-pink/15 border border-neon-pink/30 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">⚔️</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Battle 1v1</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Go head-to-head each round. Pick your best track and let it ride.
            </p>
          </div>

          <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">👑</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Claim the Crown</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Friends vote on the winner each round. Last one standing takes the crown.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 text-center py-6 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>

      <CreateDuelModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinDuelModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  )
}

export default Landing
