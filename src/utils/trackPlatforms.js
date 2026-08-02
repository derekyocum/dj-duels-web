import { SpotifyIcon, YouTubeIcon } from '../components/PlatformIcons'

// Shared between the duel's "lock in a track" flow and the lounge's "add to
// queue" flow, so the two can't drift on what counts as a valid link.
export function detectPlatform(url) {
  if (url.includes('spotify.com/track/')) return 'spotify'
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('music.youtube.com/watch')) return 'youtube'
  return null
}

export const PLATFORM_ICON = {
  spotify: { Icon: SpotifyIcon, color: '#1DB954' },
  youtube: { Icon: YouTubeIcon, color: '#FF0000' },
}
