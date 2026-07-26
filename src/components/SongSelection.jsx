import { useState, useRef } from 'react'
import CountdownTimer from './CountdownTimer'
import { SpotifyIcon, YouTubeIcon } from './PlatformIcons'
import { fetchSpotifyTrack, fetchYouTubeTrack } from '../utils/api'

function detectPlatform(url) {
  if (url.includes('spotify.com/track/')) return 'spotify'
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('music.youtube.com/watch')) return 'youtube'
  return null
}

const PLATFORM_ICON = {
  spotify: { Icon: SpotifyIcon, color: '#1DB954' },
  youtube: { Icon: YouTubeIcon, color: '#FF0000' },
}

function SongSelection({ opponent, timeLeft, totalTime = 90, roundNum, roundLabel, onLockIn }) {
  const [songLink, setSongLink] = useState('')
  const [trackInfo, setTrackInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const handleLinkChange = (value) => {
    setSongLink(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = value.trim()
    const platform = detectPlatform(trimmed)

    if (!trimmed || !platform) {
      setTrackInfo(null)
      setError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = platform === 'spotify'
          ? await fetchSpotifyTrack(trimmed)
          : await fetchYouTubeTrack(trimmed)
        setTrackInfo(data)
      } catch (e) {
        setError(e.message)
        setTrackInfo(null)
      } finally {
        setLoading(false)
      }
    }, 500)
  }

  const handleLockIn = () => {
    if (trackInfo && onLockIn) {
      onLockIn(trackInfo)
    }
  }

  const previewIcon = trackInfo ? PLATFORM_ICON[trackInfo.source] : null

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-lg mx-auto w-full">
      <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20 mb-4">
        {roundLabel || `Round ${roundNum}`}
      </span>

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Pick your track</h2>
      <p className="text-text-secondary text-sm mb-6">
        You're up against <span className="text-text-primary font-semibold">{opponent.name}</span>
      </p>

      <div className="mb-8">
        <CountdownTimer timeLeft={timeLeft} totalTime={totalTime} />
      </div>

      <div className="w-full mb-6">
        <input
          type="url"
          value={songLink}
          onChange={(e) => handleLinkChange(e.target.value)}
          placeholder="Paste a Spotify, YouTube, or Apple Music link"
          className="w-full bg-card/60 border border-text-muted/20 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors"
        />
      </div>

      {loading && (
        <div className="w-full bg-card/60 border border-text-muted/15 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-card-hover animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-card-hover rounded w-3/4 mb-1.5 animate-pulse" />
            <div className="h-3 bg-card-hover/60 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      )}

      {error && (
        <div className="w-full bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3 mb-6">
          <p className="text-neon-pink text-sm">{error}</p>
        </div>
      )}

      {trackInfo && !loading && (
        <div className="w-full bg-card/60 border border-neon-blue/20 rounded-xl p-4 mb-6 flex items-center gap-4">
          {trackInfo.albumArtUrl && (
            <img
              src={trackInfo.albumArtUrl}
              alt={trackInfo.album || trackInfo.name}
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-text-primary font-semibold text-sm truncate">{trackInfo.name}</p>
            <p className="text-text-secondary text-xs truncate">{trackInfo.artist}</p>
            {trackInfo.source === 'spotify' && (
              <p className="text-text-muted text-xs truncate">{trackInfo.album}</p>
            )}
          </div>
          {previewIcon && <previewIcon.Icon className="w-5 h-5 shrink-0" style={{ color: previewIcon.color }} />}
        </div>
      )}

      <button
        onClick={handleLockIn}
        disabled={!trackInfo}
        className={`w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 ${
          trackInfo
            ? 'cursor-pointer hover:shadow-[0_0_30px_rgba(0,128,255,0.3)]'
            : 'opacity-40 cursor-not-allowed'
        }`}
      >
        Lock In
      </button>
      <p className="text-text-muted text-xs mt-2">
        {trackInfo ? 'Ready to lock in your track!' : 'Select or paste a track to lock in'}
      </p>
    </div>
  )
}

export default SongSelection
