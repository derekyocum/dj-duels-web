import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import AppBackground from '../components/AppBackground'
import Logo from '../components/Logo'
import PlatformButton from '../components/PlatformButton'
import { useAuth } from '../context/AuthContext'
import { fetchPlatformStatus, getPlatformAuthorizeUrl, disconnectPlatform, fetchMyStats } from '../utils/api'

const PLATFORM_NAMES = { spotify: 'Spotify', youtube: 'YouTube' }
const DEFAULT_STATUS = [{ platform: 'spotify', connected: false }, { platform: 'youtube', connected: false }]

// Pure fetch, no setState -- safe to call from an effect's .then() or a plain
// event handler alike.
async function loadPlatformStatus() {
  try {
    return await fetchPlatformStatus()
  } catch {
    return DEFAULT_STATUS
  }
}

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [platforms, setPlatforms] = useState([])
  const [connectingPlatform, setConnectingPlatform] = useState(null)
  const [stats, setStats] = useState(null)

  const justConnected = searchParams.get('connected')
  const connectError = searchParams.get('connect_error')

  useEffect(() => {
    let ignore = false
    loadPlatformStatus().then((statuses) => {
      if (!ignore) setPlatforms(statuses)
    })
    // Best-effort: if stats fail to load, the card just shows zeros.
    fetchMyStats()
      .then((s) => { if (!ignore) setStats(s) })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  // Strip the ?connected=/?connect_error= param after showing its banner once,
  // so a refresh doesn't keep re-showing a stale success/error message.
  useEffect(() => {
    if (!justConnected && !connectError) return
    const t = setTimeout(() => setSearchParams({}, { replace: true }), 4000)
    return () => clearTimeout(t)
  }, [justConnected, connectError, setSearchParams])

  const handleConnect = async (platform) => {
    setConnectingPlatform(platform)
    try {
      const url = await getPlatformAuthorizeUrl(platform)
      window.location.href = url
    } catch {
      setConnectingPlatform(null)
    }
  }

  const handleDisconnect = async (platform) => {
    try {
      await disconnectPlatform(platform)
    } catch {
      // best effort -- status just won't update if this fails
    }
    setPlatforms(await loadPlatformStatus())
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initial = user?.username?.charAt(0).toUpperCase() ?? '?'
  const byPlatform = Object.fromEntries(platforms.map((p) => [p.platform, p]))

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-2 no-underline">
          <Logo className="w-7 h-7" />
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

          {justConnected && (
            <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-neon-green text-sm font-medium">
                {PLATFORM_NAMES[justConnected] || justConnected} connected!
              </p>
            </div>
          )}
          {connectError && (
            <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-neon-pink text-sm font-medium">
                Couldn&apos;t connect {PLATFORM_NAMES[connectError] || connectError} — please try again.
              </p>
            </div>
          )}

          {/* Avatar + name */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-full bg-neon-blue/20 border-2 border-neon-blue/50 shadow-[0_0_40px_rgba(0,128,255,0.2)] flex items-center justify-center mb-4">
              <span className="text-neon-blue font-black text-4xl">{initial}</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{user?.username}</h1>
            <p className="text-text-muted text-sm mt-1">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <div className="bg-card/60 border border-neon-yellow/20 rounded-2xl p-6 flex items-center gap-5 mb-4">
              <div className="w-14 h-14 rounded-xl bg-neon-yellow/10 border border-neon-yellow/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-0.5">Trophies</p>
                <p className="text-3xl font-black text-neon-yellow tabular-nums">{stats?.trophies ?? 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Wins', value: stats?.wins ?? 0, cls: 'text-neon-green' },
                { label: 'Losses', value: stats?.losses ?? 0, cls: 'text-neon-pink' },
                { label: 'Games', value: stats?.gamesPlayed ?? 0, cls: 'text-text-primary' },
              ].map((s) => (
                <div key={s.label} className="bg-card/60 border border-text-muted/15 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-black tabular-nums ${s.cls}`}>{s.value}</p>
                  <p className="text-text-muted text-[11px] font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
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

          {/* Connect Your Music */}
          <div className="bg-card/60 border border-text-muted/15 rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-text-muted/10">
              <h2 className="text-text-primary font-semibold text-sm">Connect Your Music</h2>
            </div>
            <div className="p-4 space-y-2.5">
              <PlatformButton
                name="Spotify"
                platform="spotify"
                connected={!!byPlatform.spotify?.connected}
                accountDisplayName={byPlatform.spotify?.accountDisplayName}
                connecting={connectingPlatform === 'spotify'}
                onConnect={() => handleConnect('spotify')}
                onDisconnect={() => handleDisconnect('spotify')}
              />
              <PlatformButton
                name="YouTube"
                platform="youtube"
                connected={!!byPlatform.youtube?.connected}
                accountDisplayName={byPlatform.youtube?.accountDisplayName}
                connecting={connectingPlatform === 'youtube'}
                onConnect={() => handleConnect('youtube')}
                onDisconnect={() => handleDisconnect('youtube')}
              />
              <PlatformButton name="Apple Music" platform="apple" comingSoon />
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
