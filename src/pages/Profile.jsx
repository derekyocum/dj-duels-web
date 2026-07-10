import { useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initial = user?.username?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary hover:border-text-muted/50 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Avatar + name */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-full bg-neon-blue/20 border-2 border-neon-blue/50 shadow-[0_0_40px_rgba(0,212,255,0.2)] flex items-center justify-center mb-4">
              <span className="text-neon-blue font-black text-4xl">{initial}</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{user?.username}</h1>
            <p className="text-text-muted text-sm mt-1">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-neon-yellow/10 border border-neon-yellow/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-0.5">Battles Won</p>
                <p className="text-3xl font-black text-text-primary">0</p>
              </div>
            </div>
          </div>

          {/* Account info card */}
          <div className="bg-card/60 border border-text-muted/15 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-text-muted/10">
              <h2 className="text-text-primary font-semibold text-sm">Account</h2>
            </div>
            <div className="divide-y divide-text-muted/10">
              <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-text-muted text-sm">Username</span>
                <span className="text-text-primary text-sm font-medium">{user?.username}</span>
              </div>
              <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-text-muted text-sm">Email</span>
                <span className="text-text-primary text-sm font-medium">{user?.email}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 text-center py-6 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>
    </div>
  )
}

export default Profile
