import { AppleMusicIcon, SpotifyIcon, YouTubeIcon } from '../components/PlatformIcons'

// Shared between the duel's "lock in a track" flow and the lounge's "add to
// queue" flow, so the two can't drift on what counts as a valid link.
//
// Apple Music links come in two shapes and users paste both:
//   .../album/some-album/1440857781?i=1440857999   <- a song inside an album
//   .../song/some-song/1440857999                  <- a song's own page
// Matching the host alone is enough here; the backend extracts the id and is
// the one that has to tell those two apart (see AppleMusicService).
export function detectPlatform(url) {
  if (url.includes('music.apple.com/')) return 'applemusic'
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('music.youtube.com/watch')) return 'youtube'
  return null
}

/**
 * Icon + brand color per source.
 *
 * SPOTIFY IS STILL HERE ON PURPOSE, even though it can no longer be connected
 * or picked. Every match ever won is stored in dj-duels-matches with its
 * source, so the landing page's winners wall is full of rows carrying
 * source:"spotify" and will be forever. Dropping the entry would leave those
 * cards with a missing icon -- deleting history to tidy up a lookup table.
 *
 * detectPlatform above is the gate for what can be ADDED; this map is what can
 * be DISPLAYED, and those two are deliberately not the same set.
 */
export const PLATFORM_ICON = {
  applemusic: { Icon: AppleMusicIcon, color: '#FA243C' },
  youtube: { Icon: YouTubeIcon, color: '#FF0000' },
  spotify: { Icon: SpotifyIcon, color: '#1DB954' },
}
