import { fetchAppleMusicDeveloperToken, storeAppleMusicUserToken } from './api'

/**
 * Full-length Apple Music playback in the browser, via MusicKit JS v3 --
 * the replacement for spotifyWebPlayback.js.
 *
 * Deliberately mirrors that module's exported shape (init / status+subscribe /
 * play / pause / reconcile) so Stage.jsx and NowPlaying.jsx swap call sites
 * rather than restructure. The lifecycle problems are identical; only the
 * vendor changed.
 *
 * UNITS: MusicKit works in SECONDS. Everything else in this app -- the room's
 * server-owned timeline, durationMs, positionMs -- is milliseconds. Every
 * crossing is converted at the boundary here, and nowhere else, so callers
 * keep speaking ms. Getting this wrong doesn't error, it just seeks to a
 * wildly wrong place, which is exactly the kind of bug that survives review.
 */

let initStarted = false
let music = null
let status = 'connecting' // 'connecting' | 'ready' | 'unavailable'
const listeners = new Set()

function setStatus(next) {
  status = next
  listeners.forEach((cb) => cb(status))
}

export function getAppleMusicStatus() {
  return status
}

export function subscribeAppleMusicStatus(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

let sdkPromise = null
function loadMusicKitSdk() {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise((resolve, reject) => {
    // MusicKit announces itself with a window event rather than a callback
    // global, unlike Spotify's onSpotifyWebPlaybackSDKReady.
    if (window.MusicKit) {
      resolve(window.MusicKit)
      return
    }
    document.addEventListener('musickitloaded', () => resolve(window.MusicKit), { once: true })
    const script = document.createElement('script')
    script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js'
    script.async = true
    script.onerror = () => reject(new Error('MusicKit script failed to load'))
    document.body.appendChild(script)
  })
  return sdkPromise
}

/**
 * Idempotent -- safe to call from every Stage/Lounge mount.
 *
 * Fetches the developer token first and bails before touching the script tag
 * if it isn't provisioned, for the same reason the Spotify module checked
 * connectivity first: no point loading a player for the common case where the
 * backend can't authorize it anyway.
 */
export async function ensureAppleMusicInitialized() {
  if (initStarted) return
  initStarted = true

  let developerToken
  try {
    developerToken = await fetchAppleMusicDeveloperToken()
  } catch (err) {
    // 'not_configured' means the MusicKit key isn't in the environment yet --
    // a deployment state, not a user problem. Logged with the reason because
    // the visible symptom either way is just "no sound", which is what made
    // the Spotify version of this so hard to diagnose.
    console.warn('[AppleMusic] playback unavailable -- no developer token.',
      'reason:', err?.code ?? err?.message ?? err,
      '| falling back to preview playback.')
    setStatus('unavailable')
    return
  }

  try {
    const MusicKit = await loadMusicKitSdk()
    music = await MusicKit.configure({
      developerToken,
      app: { name: 'DJ Duels', build: '1.0.0' },
    })
    setStatus('ready')
  } catch (err) {
    console.warn('[AppleMusic] MusicKit failed to configure:', err?.message ?? err)
    setStatus('unavailable')
  }
}

/** Whether this browser already holds a Music User Token. */
export function isAppleMusicAuthorized() {
  return Boolean(music?.isAuthorized)
}

/**
 * Prompts for Apple Music access and persists the resulting token.
 *
 * This IS the connect flow -- there is no redirect to a consent page and no
 * callback, so unlike the Spotify/YouTube buttons this never leaves the app.
 * The token is posted to our backend so server-side library calls can use it
 * later.
 */
export async function authorizeAppleMusic() {
  if (!music) throw new Error('Apple Music is not initialized')
  const musicUserToken = await music.authorize()
  await storeAppleMusicUserToken(musicUserToken)
  return musicUserToken
}

/**
 * Starts a track at the room's position.
 *
 * positionMs keeps a late joiner on the room's timeline instead of restarting
 * the song for themselves -- the Listening Lounge's whole premise. Seeking is
 * a separate call after the queue starts, since setQueue has no position
 * parameter.
 */
export async function playAppleMusicTrack(songId, positionMs = 0) {
  if (!music || status !== 'ready') {
    console.warn('[AppleMusic] play requested before MusicKit was ready -- no audio for this track.')
    return
  }
  try {
    await music.setQueue({ song: songId, startPlaying: true })
    if (positionMs > 0) {
      await music.seekToTime(Math.max(0, positionMs) / 1000)
    }
  } catch (err) {
    // A non-subscriber gets preview-only rather than an outright failure, so
    // this is genuinely exceptional: an unplayable/region-locked track, or the
    // queue being rejected.
    console.warn('[AppleMusic] play rejected:', err?.message ?? err)
  }
}

/** Callers must pause explicitly -- MusicKit keeps playing after the component
 *  that started it unmounts, same as the Spotify singleton did. */
export function pauseAppleMusicPlayback() {
  try {
    music?.pause()
  } catch {
    // Pausing an already-stopped player isn't worth surfacing.
  }
}

// Same tolerances, and the same reasoning, as the Spotify module they replace.
const DRIFT_TOLERANCE_MS = 2000
const TRACK_END_GUARD_MS = 5000

/**
 * Pulls this listener back onto the room's timeline. Playback is started once
 * per track and then left alone, so nothing otherwise notices someone falling
 * behind after a buffer or pausing from another tab.
 *
 * @returns 'idle' | 'paused' | 'corrected' | 'ok'
 *
 * No 'elsewhere' case, unlike Spotify: MusicKit plays in this page rather than
 * registering as a network device, so there is no equivalent of another device
 * silently stealing playback.
 */
export async function reconcileAppleMusicPlayback({ expectedPositionMs, durationMs }) {
  if (!music || status !== 'ready') return 'idle'

  // Near a track boundary the server is about to advance the room anyway, and
  // correcting here just fights the transition.
  if (durationMs && expectedPositionMs > durationMs - TRACK_END_GUARD_MS) return 'ok'

  // MusicKit reports seconds; the room speaks milliseconds.
  const actualMs = (music.currentPlaybackTime ?? 0) * 1000

  if (music.playbackState !== undefined && music.isPlaying === false) return 'paused'

  if (Math.abs(actualMs - expectedPositionMs) > DRIFT_TOLERANCE_MS) {
    try {
      await music.seekToTime(Math.max(0, expectedPositionMs) / 1000)
    } catch {
      return 'ok' // a failed nudge isn't worth surfacing; the next tick retries
    }
    return 'corrected'
  }

  return 'ok'
}
