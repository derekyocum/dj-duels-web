import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import AppBackground from '../components/AppBackground'
import AppNav from '../components/AppNav'
import PlatformButton from '../components/PlatformButton'
import AvatarPicker from '../components/AvatarPicker'
import Avatar from '../components/Avatar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { fetchPlatformStatus, getPlatformAuthorizeUrl, disconnectPlatform, fetchMyStats, fetchFriends } from '../utils/api'
import { ensureAppleMusicInitialized, authorizeAppleMusic } from '../utils/appleMusicPlayback'

const PLATFORM_NAMES = { applemusic: 'Apple Music', youtube: 'YouTube' }
const DEFAULT_STATUS = [{ platform: 'applemusic', connected: false }, { platform: 'youtube', connected: false }]

// Pure fetch, no setState -- safe to call from an effect's .then() or a plain
// event handler alike.
async function loadPlatformStatus() {
  try {
    return await fetchPlatformStatus()
  } catch {
    return DEFAULT_STATUS
  }
}

// Same deal as loadPlatformStatus -- pure fetch, no setState. Returns null on
// failure so the caller can keep whatever's already on screen rather than
// blanking the list over a transient error.
async function loadFriendsData() {
  try {
    return await fetchFriends()
  } catch {
    return null
  }
}

function Profile() {
  const { user, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [platforms, setPlatforms] = useState([])
  const [connectingPlatform, setConnectingPlatform] = useState(null)
  const [stats, setStats] = useState(null)
  // Count only -- the list itself lives on /friends now.
  const [pendingRequests, setPendingRequests] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [avatarId, setAvatarId] = useState(null)
  const [avatarColor, setAvatarColor] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const justConnected = searchParams.get('connected')
  const connectError = searchParams.get('connect_error')

  useEffect(() => {
    let ignore = false
    loadPlatformStatus().then((statuses) => {
      if (!ignore) setPlatforms(statuses)
    })
    // Best-effort: if stats fail to load, the card just shows zeros.
    fetchMyStats()
      .then((s) => { if (!ignore) { setStats(s); setAvatarId(s.avatarId ?? null); setAvatarColor(s.avatarColor ?? null) } })
      .catch(() => {})
    loadFriendsData().then((data) => {
      if (!ignore && data) setPendingRequests(data.incoming?.length ?? 0)
    })
    return () => { ignore = true }
  }, [])

  // Strip the ?connected=/?connect_error= param after showing its banner once,
  // so a refresh doesn't keep re-showing a stale success/error message.
  useEffect(() => {
    if (!justConnected && !connectError) return
    const t = setTimeout(() => setSearchParams({}, { replace: true }), 4000)
    return () => clearTimeout(t)
  }, [justConnected, connectError, setSearchParams])

  /**
   * Two shapes, because Apple Music genuinely has no redirect flow: MusicKit
   * prompts on-device and hands back a token, so connecting never leaves the
   * page. YouTube still does the classic authorize-URL handoff.
   */
  const handleConnect = async (platform) => {
    setConnectingPlatform(platform)
    if (platform === 'applemusic') {
      try {
        await ensureAppleMusicInitialized()
        await authorizeAppleMusic()
        setPlatforms(await loadPlatformStatus())
      } catch {
        // Declining the Apple Music prompt is a normal choice, not an error.
      } finally {
        setConnectingPlatform(null)
      }
      return
    }
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

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount()
      navigate('/')
    } catch (err) {
      setDeleting(false)
      setDeleteError(err.message)
    }
  }

  const byPlatform = Object.fromEntries(platforms.map((p) => [p.platform, p]))

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

      <AppNav />

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
            <button
              onClick={() => setPickerOpen(true)}
              className="relative mb-4 cursor-pointer group"
              aria-label="Change profile picture"
              title="Change profile picture"
            >
              <Avatar username={user?.username} avatarId={avatarId} avatarColor={avatarColor} size={96} borderWidth={2} />
              <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-card border border-text-muted/30 flex items-center justify-center text-xs group-hover:border-ember/50 transition-colors">
                ✏️
              </span>
            </button>
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
            <Link
              to="/leaderboard"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-neon-yellow/25 text-neon-yellow text-sm font-semibold hover:bg-neon-yellow/10 transition-colors"
            >
              🏆 View leaderboard
            </Link>
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

          {/* Friends moved to its own page (matching mobile), but the pending
              count still surfaces here -- otherwise an incoming request has
              nowhere to announce itself short of opening the page on spec. */}
          <Link
            to="/friends"
            className="mt-8 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-neon-cyan/25 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/10 transition-colors"
          >
            👥 Friends
            {pendingRequests > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-neon-cyan/15 border border-neon-cyan/30">
                {pendingRequests}
              </span>
            )}
          </Link>

          {/* Connect Your Music */}
          <div className="bg-card/60 border border-text-muted/15 rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-text-muted/10">
              <h2 className="text-text-primary font-semibold text-sm">Connect Your Music</h2>
            </div>
            <div className="p-4 space-y-2.5">
              {/* No needsReconnect here, unlike the Spotify button this
                  replaces: that existed because Spotify only grants scopes
                  consented to at connect time, so an older connection could be
                  silently missing playback rights. Apple Music has no scopes to
                  drift out of date -- a connection either has a valid user
                  token or it doesn't. */}
              <PlatformButton
                name="Apple Music"
                platform="applemusic"
                connected={!!byPlatform.applemusic?.connected}
                accountDisplayName={byPlatform.applemusic?.accountDisplayName}
                connecting={connectingPlatform === 'applemusic'}
                onConnect={() => handleConnect('applemusic')}
                onDisconnect={() => handleDisconnect('applemusic')}
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
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-card/60 border border-neon-pink/20 rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-neon-pink/10">
              <h2 className="text-neon-pink font-semibold text-sm">Danger Zone</h2>
            </div>
            <div className="px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-text-primary text-sm font-medium">Delete account</p>
                <p className="text-text-muted text-xs mt-0.5">Permanently deletes your account, stats, and connections.</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 px-4 py-2 text-sm font-semibold rounded-lg border border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {pickerOpen && (
        <AvatarPicker
          current={avatarId}
          currentColor={avatarColor}
          onSaved={({ avatarId: id, avatarColor: color }) => { setAvatarId(id); setAvatarColor(color) }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-dark-surface border border-neon-pink/25 rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-xl font-bold text-text-primary mb-2">Delete account?</h2>
            <p className="text-text-secondary text-sm mb-5">
              This permanently deletes your account, including your stats, trophies, and any connected Apple Music/YouTube accounts. This cannot be undone.
            </p>

            {deleteError && (
              <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-neon-pink text-sm">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 text-sm font-semibold rounded-full border border-text-muted/30 text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 text-sm font-bold rounded-full bg-neon-pink text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
