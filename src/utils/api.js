const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const authHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('dj_duels_user') || '{}')
    return user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}
  } catch {
    return {}
  }
}

// "Find a Duel" / "Find a Lounge" -- authenticated REST polling, no WebSocket
// while waiting (see MatchmakingController on the backend for why). Groups
// are a fixed 5 players, matched entirely within their own mode's queue; once
// matched, the client joins the normal /lobby/:duelId or /lounge/:loungeId
// flow for the returned roomId.
export async function joinMatchmaking(mode) {
  const response = await fetch(`${API_BASE}/api/matchmaking/join`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  })
  if (!response.ok) throw new Error('Failed to join matchmaking')
}

export async function matchmakingStatus() {
  const response = await fetch(`${API_BASE}/api/matchmaking/status`, { headers: authHeaders() })
  if (!response.ok) throw new Error('Failed to check matchmaking status')
  return response.json() // { status: 'waiting'|'matched'|'not_queued', mode, roomId, position }
}

export async function cancelMatchmaking() {
  const response = await fetch(`${API_BASE}/api/matchmaking/cancel`, { method: 'POST', headers: authHeaders() })
  if (!response.ok) throw new Error('Failed to cancel matchmaking')
}

// Hosting a Duel/Lounge used to mean the client picked a random 6-char code
// itself and navigated straight there -- two people generating the same code
// at once would silently merge into one room. These claim a server-verified
// unique code first (see RoomController), so the client only ever navigates
// to a code nobody else already has.
export async function reserveDuelCode() {
  const response = await fetch(`${API_BASE}/api/duel/new-code`, { method: 'POST', headers: authHeaders() })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to start a duel')
  return data.duelId
}

export async function reserveLoungeCode() {
  const response = await fetch(`${API_BASE}/api/lounge/new-code`, { method: 'POST', headers: authHeaders() })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to start a lounge')
  return data.loungeId
}

export async function fetchSpotifyTrack(url) {
  const response = await fetch(`${API_BASE}/api/tracks/spotify?url=${encodeURIComponent(url)}`, {
    headers: authHeaders(),
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch track')
  }

  return { ...data, source: 'spotify' }
}

export async function fetchYouTubeTrack(url) {
  const response = await fetch(`${API_BASE}/api/tracks/youtube?url=${encodeURIComponent(url)}`, {
    headers: authHeaders(),
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch video')
  }

  return {
    id: data.videoId,
    name: data.title,
    artist: data.artist,
    album: 'YouTube',
    albumArtUrl: data.thumbnailUrl,
    videoId: data.videoId,
    youtubeUrl: data.youtubeUrl,
    durationMs: data.durationMs,
    source: 'youtube',
  }
}

// In-site search, both app-level (Spotify Client Credentials / a server-side
// YouTube API key) -- never routes through anyone's connected-account token,
// since search results are public data. See TrackController on the backend.
export async function searchSpotifyTracks(query) {
  const response = await fetch(`${API_BASE}/api/tracks/spotify/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Search failed')
  return data.map((t) => ({ ...t, source: 'spotify' }))
}

// --- Apple Music -------------------------------------------------------
// Apple's catalog needs only the app-level developer token, so search works
// for someone who has never connected an account -- the same property Spotify
// nominally had but couldn't deliver, since its per-user side caps an
// individual developer's app at 5 authenticated listeners.

export async function searchAppleMusicTracks(query) {
  const response = await fetch(`${API_BASE}/api/tracks/applemusic/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Search failed')
  return data.map((t) => ({ ...t, source: 'applemusic' }))
}

export async function fetchAppleMusicTrack(url) {
  const response = await fetch(`${API_BASE}/api/tracks/applemusic?url=${encodeURIComponent(url)}`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch track')
  return { ...data, source: 'applemusic' }
}

// Initializes MusicKit. Safe to expose: it authorizes the APP against the
// catalog and carries no user identity -- the user-scoped half never comes
// from the server, MusicKit mints it on the device.
export async function fetchAppleMusicDeveloperToken() {
  const response = await fetch(`${API_BASE}/api/platforms/applemusic/developer-token`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to fetch developer token')
    err.code = data.error
    throw err
  }
  return data.developerToken
}

// Connecting Apple Music is just handing the server the token MusicKit already
// gave us -- there's no authorize URL or callback for this platform.
export async function storeAppleMusicUserToken(musicUserToken) {
  const response = await fetch(`${API_BASE}/api/platforms/applemusic/user-token`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ musicUserToken }),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to connect Apple Music')
    err.code = data.error
    throw err
  }
  return data
}

// One-way by necessity: Apple's public API has no supported removal and no
// reliable "is it saved" check, so there is no unlike/status counterpart to
// pair with this. See AppleMusicLibraryService on the backend.
export async function addToAppleMusicLibrary(songId) {
  const response = await fetch(`${API_BASE}/api/platforms/applemusic/library/${encodeURIComponent(songId)}`, {
    method: 'PUT',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to add to library')
    err.code = data.error
    throw err
  }
  return data
}

export async function searchYouTubeVideos(query) {
  const response = await fetch(`${API_BASE}/api/tracks/youtube/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Search failed')
  return data.map((v) => ({
    id: v.videoId,
    name: v.title,
    artist: v.artist,
    album: 'YouTube',
    albumArtUrl: v.thumbnailUrl,
    videoId: v.videoId,
    youtubeUrl: v.youtubeUrl,
    durationMs: v.durationMs,
    source: 'youtube',
  }))
}

export async function fetchPlatformStatus() {
  const response = await fetch(`${API_BASE}/api/platforms/status`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch connection status')
  return data
}

export async function getPlatformAuthorizeUrl(platform) {
  const response = await fetch(`${API_BASE}/api/platforms/${platform}/authorize`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to start connection')
  return data.authorizeUrl
}

// { accessToken, expiresIn } on success. On a 409 (not connected / connected
// without the "streaming" scope), throws with `.code` set to the backend's
// error string so the caller can fall back without treating it as a hard failure.
export async function fetchSpotifyPlaybackToken() {
  const response = await fetch(`${API_BASE}/api/platforms/spotify/playback-token`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to fetch playback token')
    err.code = data.error
    throw err
  }
  return data
}

// { liked: boolean } on success. On a 409 (not connected / connected without
// "user-library-modify"), throws with `.code` set to the backend's error
// string -- same shape as fetchSpotifyPlaybackToken, same reason: the caller
// needs to tell "never connected" apart from "needs to reconnect" to prompt
// the right thing rather than a generic failure.
export async function fetchSpotifyLikedStatus(trackId) {
  const response = await fetch(`${API_BASE}/api/platforms/spotify/liked/${encodeURIComponent(trackId)}`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to check liked status')
    err.code = data.error
    throw err
  }
  return data
}

export async function likeSpotifyTrack(trackId) {
  const response = await fetch(`${API_BASE}/api/platforms/spotify/liked/${encodeURIComponent(trackId)}`, {
    method: 'PUT',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to save track')
    err.code = data.error
    throw err
  }
  return data
}

export async function unlikeSpotifyTrack(trackId) {
  const response = await fetch(`${API_BASE}/api/platforms/spotify/liked/${encodeURIComponent(trackId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to remove track')
    err.code = data.error
    throw err
  }
  return data
}

export async function disconnectPlatform(platform) {
  const response = await fetch(`${API_BASE}/api/platforms/${platform}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to disconnect')
  return data
}

// { friends: [{username, since}], incoming: [...], outgoing: [...] }
export async function fetchFriends() {
  const response = await fetch(`${API_BASE}/api/friends`, { headers: authHeaders() })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to load friends')
  return data
}

export async function sendFriendRequest(username) {
  const response = await fetch(`${API_BASE}/api/friends/requests`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to send request')
  return data
}

export async function acceptFriendRequest(username) {
  const response = await fetch(`${API_BASE}/api/friends/requests/${encodeURIComponent(username)}/accept`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to accept request')
  return data
}

// Declining a request, withdrawing one you sent, and unfriending are all the
// same server-side removal -- one function rather than three identical ones.
export async function removeFriend(username) {
  const response = await fetch(`${API_BASE}/api/friends/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to remove')
  return data
}

// Invites are delivery-only, not a new access gate: Duel is already open-join
// and Lounge already gates on friendship, so a friend can always join once
// they see the invite. Delivery is polled (fetchInvites), not pushed -- the
// app has no live per-user channel outside an active room.
export async function sendLobbyInvite(toUsername, roomType, roomId) {
  const response = await fetch(`${API_BASE}/api/invites`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUsername, roomType, roomId }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to send invite')
  return data
}

export async function fetchInvites() {
  const response = await fetch(`${API_BASE}/api/invites`, { headers: authHeaders() })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to load invites')
  return data
}

export async function dismissInvite(id) {
  const response = await fetch(`${API_BASE}/api/invites/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to dismiss invite')
  return data
}

// Blocking ends any friendship or pending request in the same server-side
// write, so callers don't need to unfriend first.
export async function blockUser(username) {
  const response = await fetch(`${API_BASE}/api/friends/${encodeURIComponent(username)}/block`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to block')
  return data
}

export async function unblockUser(username) {
  const response = await fetch(`${API_BASE}/api/friends/${encodeURIComponent(username)}/block`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to unblock')
  return data
}

/** Reports a user. `reason` must be one of the server's whitelist -- see
 *  ReportController.VALID_REASONS. Returns 202: accepted for review. */
export async function reportUser({ username, reason, detail = '', context = '' }) {
  const response = await fetch(`${API_BASE}/api/reports`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportedUsername: username, reason, detail, context }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to send report')
  return data
}

export async function fetchMyStats() {
  const response = await fetch(`${API_BASE}/api/stats/me`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch stats')
  return data // { username, trophies, wins, losses, gamesPlayed }
}

export async function setMyAvatar(avatarId) {
  const response = await fetch(`${API_BASE}/api/stats/me/avatar`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatarId }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to save avatar')
  return data
}

// Only matters when avatarId is unset -- the color of the initials-letter
// fallback, independent of any chosen icon.
export async function setMyAvatarColor(avatarColor) {
  const response = await fetch(`${API_BASE}/api/stats/me/avatar-color`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatarColor }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to save color')
  return data
}

/** Resolves chosen icon/color for a batch of usernames in one request --
 *  what a duel roster or lounge room uses to show everyone's real profile
 *  picture instead of one request per player. Never throws: an avatar lookup
 *  failing must not break the screen it's decorating, so callers get an
 *  empty list and fall back to plain initials. */
export async function fetchAvatars(usernames) {
  const unique = [...new Set(usernames)].filter(Boolean)
  if (unique.length === 0) return []
  try {
    const response = await fetch(`${API_BASE}/api/stats/avatars?usernames=${encodeURIComponent(unique.join(','))}`, {
      headers: authHeaders(),
    })
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// ── Showcase (landing page) ──────────────────────────────────────────────────
// The two reads are PUBLIC: the landing page renders for signed-out visitors,
// so these deliberately send no auth header. Both resolve to null/[] rather
// than throwing -- a marketing section must never be able to break the page it
// sits on, and "nothing to show yet" is a normal state on a young app.

/** The reigning trophy leader, or null when nobody has won anything yet
 *  (the server answers 204 for that rather than inventing a zero state). */
export async function fetchChampion() {
  try {
    const response = await fetch(`${API_BASE}/api/showcase/champion`)
    if (response.status === 204 || !response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

/** Recently won tracks, newest first. Anonymous by design -- the server sends
 *  no usernames, only the track and its global 🔥 count. */
export async function fetchRecentTracks(limit = 12) {
  try {
    const response = await fetch(`${API_BASE}/api/showcase/recent-tracks?limit=${limit}`)
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** Adds this user's single 🔥. Requires auth. Throws with `.code === 'already_fired'`
 *  on a repeat so the caller can just light the button rather than show an error. */
export async function fireTrack(matchId) {
  const response = await fetch(`${API_BASE}/api/showcase/tracks/${encodeURIComponent(matchId)}/fire`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to record')
    err.code = data.error
    throw err
  }
  return data
}

export async function fetchLeaderboard(limit = 20) {
  const response = await fetch(`${API_BASE}/api/stats/leaderboard?limit=${limit}`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch leaderboard')
  return data // [{ username, trophies, wins, losses, gamesPlayed }, ...]
}
