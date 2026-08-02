import { fetchSpotifyPlaybackToken } from './api'

// Module-level singleton: the Web Playback SDK expects exactly one
// Spotify.Player per browser session, created once and kept connected --
// Stage mounts/unmounts every round, so this deliberately lives outside any
// component and just gets reused across mounts. Mirrors the module-level
// loadSpotifyIframeApi() singleton already established in Stage.jsx, for the
// same "only ever inject/create once" reason.

let cachedToken = null // { accessToken, expiresAt: epochMs }
let initStarted = false
let player = null
let deviceId = null
let status = 'connecting' // 'connecting' | 'ready' | 'unavailable'
const listeners = new Set()

function setStatus(next) {
  status = next
  listeners.forEach((cb) => cb(status))
}

export function getSpotifyPlaybackStatus() {
  return status
}

export function subscribeSpotifyPlaybackStatus(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

async function getPlaybackToken() {
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.accessToken
  }
  const { accessToken, expiresIn } = await fetchSpotifyPlaybackToken()
  cachedToken = { accessToken, expiresAt: Date.now() + expiresIn * 1000 }
  return cachedToken.accessToken
}

let spotifySdkPromise = null
function loadSpotifySdk() {
  if (spotifySdkPromise) return spotifySdkPromise
  spotifySdkPromise = new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve(window.Spotify)
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
  })
  return spotifySdkPromise
}

// Checks connectivity first via the backend (no point loading the SDK script
// for the common not-connected-yet case, which is everyone today), then
// creates the one Player for the session. Idempotent -- safe to call from
// every Stage mount.
export async function ensureSpotifyPlaybackInitialized() {
  if (initStarted) return
  initStarted = true
  try {
    await getPlaybackToken()
  } catch {
    // Not connected, or connected from before the "streaming" scope existed --
    // the caller falls back to the existing 30s-preview iframe embed.
    setStatus('unavailable')
    return
  }

  const Spotify = await loadSpotifySdk()
  player = new Spotify.Player({
    name: 'DJ Duels',
    getOAuthToken: (cb) => getPlaybackToken().then(cb).catch(() => {}),
    volume: 1,
  })

  player.addListener('ready', ({ device_id }) => {
    deviceId = device_id
    setStatus('ready')
  })
  // account_error: non-Premium account (Web Playback SDK requires Premium).
  // authentication_error: token rejected -- shouldn't happen given the
  // up-front check above, but the SDK can still race into it. initialization_error:
  // the browser/environment can't run the SDK at all. All three mean the same
  // thing to Stage.jsx: fall back to the iframe embed for this session.
  player.addListener('account_error', () => setStatus('unavailable'))
  player.addListener('authentication_error', () => setStatus('unavailable'))
  player.addListener('initialization_error', () => setStatus('unavailable'))

  player.connect()
}

// The SDK itself has no "play this URI" method -- playback is started by
// calling Spotify's Web API directly against this device_id, same as the app
// already talks to Spotify's own domains client-side via the iframe API.
// positionMs lets a late joiner drop into the middle of whatever the room is
// already playing instead of restarting the track (the Listening Lounge's whole
// synced-listening premise). Defaults to 0 for the duel flow, which always
// starts tracks from the top.
export async function playSpotifyTrack(trackId, positionMs = 0) {
  if (!deviceId) return
  const token = await getPlaybackToken()
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ uris: [`spotify:track:${trackId}`], position_ms: Math.floor(positionMs) }),
  })
}

// The player is a headless, persistent singleton -- unlike the iframe embed it
// doesn't stop on its own when a round's component unmounts, so callers must
// explicitly pause when a track's window ends (round timeout, skip, leaving
// the playing phase, or leaving Stage entirely).
export function pauseSpotifyPlayback() {
  player?.pause().catch(() => {})
}

// How far out of step with the room a listener may drift before we correct.
// Loose enough not to fight normal jitter or a brief buffer, tight enough that
// nobody perceives being behind the rest of the room.
const DRIFT_TOLERANCE_MS = 2000
// Corrections are suppressed this close to the end of a track. The SDK's own
// state is unreliable at track boundaries -- it emits several conflicting
// player_state_changed events with positions that don't match the duration --
// and the server is about to advance the room anyway, so a "correction" here
// would just fight the natural transition.
const TRACK_END_GUARD_MS = 5000

/**
 * Pulls this listener back onto the room's timeline. Playback is started once
 * per track and then left alone, which means nothing otherwise notices a
 * listener falling behind after a buffer, pausing from the Spotify app on
 * their phone, or losing playback entirely when another device grabs it --
 * all of which leave the room silently desynced.
 *
 * Meant to be called on an interval by whoever knows the room's position.
 *
 * @returns 'idle'      no player yet, nothing to do
 *          'elsewhere' another device took playback off this one
 *          'paused'    this device is paused while the room plays on
 *          'corrected' we re-seeked (or restarted the right track)
 *          'ok'        in step with the room
 */
export async function reconcileSpotifyPlayback({ trackId, expectedPositionMs, durationMs }) {
  if (!player || status !== 'ready') return 'idle'

  const state = await player.getCurrentState()
  // getCurrentState() resolves null when this SDK device is NOT the active
  // one -- i.e. the user hit play on their phone or another tab, which
  // silently steals playback from here. Now that "DJ Duels" shows up as a real
  // Spotify device, this is a genuinely reachable state.
  if (!state) return 'elsewhere'

  if (durationMs && expectedPositionMs > durationMs - TRACK_END_GUARD_MS) return 'ok'

  // Wrong track entirely (skipped from the Spotify app, or a start that never
  // landed) -- restart at the room's position rather than seeking within a
  // track nobody else is on.
  const playingId = state.track_window?.current_track?.id
  if (playingId && trackId && playingId !== trackId) {
    await playSpotifyTrack(trackId, expectedPositionMs)
    return 'corrected'
  }

  if (state.paused) return 'paused'

  if (Math.abs(state.position - expectedPositionMs) > DRIFT_TOLERANCE_MS) {
    try {
      await player.seek(Math.floor(Math.max(0, expectedPositionMs)))
    } catch {
      return 'ok' // a failed nudge isn't worth surfacing; the next tick retries
    }
    return 'corrected'
  }

  return 'ok'
}
