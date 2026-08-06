const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const authHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('dj_duels_user') || '{}')
    return user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}
  } catch {
    return {}
  }
}

// "Find a Match" -- authenticated REST polling, no WebSocket while waiting
// (see MatchmakingController on the backend for why). Groups are a fixed 4
// players; once matched, the client joins the normal /lobby/:duelId flow.
export async function joinMatchmaking() {
  const response = await fetch(`${API_BASE}/api/matchmaking/join`, { method: 'POST', headers: authHeaders() })
  if (!response.ok) throw new Error('Failed to join matchmaking')
}

export async function matchmakingStatus() {
  const response = await fetch(`${API_BASE}/api/matchmaking/status`, { headers: authHeaders() })
  if (!response.ok) throw new Error('Failed to check matchmaking status')
  return response.json() // { status: 'waiting'|'matched'|'not_queued', duelId, position }
}

export async function cancelMatchmaking() {
  const response = await fetch(`${API_BASE}/api/matchmaking/cancel`, { method: 'POST', headers: authHeaders() })
  if (!response.ok) throw new Error('Failed to cancel matchmaking')
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
