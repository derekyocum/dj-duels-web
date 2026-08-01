import { SpotifyIcon, YouTubeIcon, AppleMusicIcon } from './PlatformIcons'

const PLATFORM_ICONS = { spotify: SpotifyIcon, youtube: YouTubeIcon, apple: AppleMusicIcon }

const PLATFORM_STYLES = {
  spotify: { border: 'border-[#1DB954]/30', bg: 'bg-[#1DB954]/15', text: 'text-[#1DB954]', activeBg: 'bg-[#1DB954]/25', iconColor: '#1DB954' },
  youtube: { border: 'border-[#FF0000]/30', bg: 'bg-[#FF0000]/15', text: 'text-[#FF0000]', activeBg: 'bg-[#FF0000]/25', iconColor: '#FF0000' },
  apple: { border: 'border-neon-blue/30', bg: 'bg-neon-blue/15', text: 'text-neon-blue', activeBg: 'bg-neon-blue/25', iconColor: '#0080ff' },
}

function PlatformButton({ name, platform, connected, accountDisplayName, needsReconnect, comingSoon, connecting, onConnect, onDisconnect }) {
  const styles = PLATFORM_STYLES[platform] || PLATFORM_STYLES.spotify
  const Icon = PLATFORM_ICONS[platform]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 w-full ${
        connected ? `${styles.activeBg} ${styles.border}` : 'bg-card/60 border-text-muted/20'
      }`}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" style={{ color: styles.iconColor }} />}
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-semibold ${connected ? styles.text : 'text-text-secondary'}`}>{name}</p>
        {connected && accountDisplayName && (
          <p className="text-text-muted text-xs truncate">Connected as {accountDisplayName}</p>
        )}
        {connected && needsReconnect && (
          // This connection predates the "streaming" scope (Web Playback SDK) --
          // Spotify only grants what was consented to, so getting full-track
          // playback needs the same authorize flow run again, not a fix on our end.
          <button
            onClick={onConnect}
            disabled={connecting}
            className="text-neon-yellow text-xs font-medium hover:underline cursor-pointer disabled:opacity-50"
          >
            {connecting ? 'Reconnecting…' : 'Reconnect for full-track playback'}
          </button>
        )}
        {comingSoon && <p className="text-text-muted text-xs">Coming soon</p>}
      </div>
      {comingSoon ? (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-text-muted/15 text-text-muted shrink-0">
          Soon
        </span>
      ) : connected ? (
        <button
          onClick={onDisconnect}
          className="text-xs font-medium px-2.5 py-1 rounded-full bg-text-muted/15 text-text-muted hover:bg-text-muted/25 transition-colors cursor-pointer shrink-0"
        >
          Disconnect
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles.bg} ${styles.text} hover:opacity-80 transition-opacity cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {connecting ? 'Connecting…' : 'Connect'}
        </button>
      )}
    </div>
  )
}

export default PlatformButton
