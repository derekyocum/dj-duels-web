import { SpotifyIcon, YouTubeIcon, AppleMusicIcon } from './PlatformIcons'

const PLATFORM_ICONS = { spotify: SpotifyIcon, youtube: YouTubeIcon, apple: AppleMusicIcon }

const PLATFORM_STYLES = {
  spotify: { border: 'border-[#1DB954]/30', bg: 'bg-[#1DB954]/15', text: 'text-[#1DB954]', activeBg: 'bg-[#1DB954]/25', iconColor: '#1DB954' },
  youtube: { border: 'border-[#FF0000]/30', bg: 'bg-[#FF0000]/15', text: 'text-[#FF0000]', activeBg: 'bg-[#FF0000]/25', iconColor: '#FF0000' },
  apple: { border: 'border-neon-blue/30', bg: 'bg-neon-blue/15', text: 'text-neon-blue', activeBg: 'bg-neon-blue/25', iconColor: '#00d4ff' },
}

function PlatformButton({ name, platform, connected, onToggle }) {
  const styles = PLATFORM_STYLES[platform] || PLATFORM_STYLES.spotify
  const Icon = PLATFORM_ICONS[platform]

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer w-full ${
        connected
          ? `${styles.activeBg} ${styles.border}`
          : `bg-card/60 border-text-muted/20 hover:bg-card-hover`
      }`}
    >
      {Icon && <Icon className="w-5 h-5" style={{ color: styles.iconColor }} />}
      <span className={`text-sm font-semibold flex-1 text-left ${connected ? styles.text : 'text-text-secondary'}`}>
        {name}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        connected
          ? `${styles.bg} ${styles.text}`
          : 'bg-text-muted/15 text-text-muted'
      }`}>
        {connected ? '✓ Connected' : 'Connect'}
      </span>
    </button>
  )
}

export default PlatformButton
