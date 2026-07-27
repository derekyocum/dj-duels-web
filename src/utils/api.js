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

export async function disconnectPlatform(platform) {
  const response = await fetch(`${API_BASE}/api/platforms/${platform}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to disconnect')
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

export async function fetchLeaderboard(limit = 20) {
  const response = await fetch(`${API_BASE}/api/stats/leaderboard?limit=${limit}`, {
    headers: authHeaders(),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch leaderboard')
  return data // [{ username, trophies, wins, losses, gamesPlayed }, ...]
}
