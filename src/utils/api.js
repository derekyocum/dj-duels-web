const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const authHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('dj_duels_user') || '{}')
    return user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}
  } catch {
    return {}
  }
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
