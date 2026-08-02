import { useState, useRef } from 'react'
import CountdownTimer from './CountdownTimer'
import SearchResultRow from './SearchResultRow'
import { detectPlatform, PLATFORM_ICON } from '../utils/trackPlatforms'
import { fetchSpotifyTrack, fetchYouTubeTrack, searchSpotifyTracks, searchYouTubeVideos } from '../utils/api'

function TrackPreview({ trackInfo }) {
  const previewIcon = PLATFORM_ICON[trackInfo.source]
  return (
    <div className="w-full bg-card/60 border border-neon-blue/20 rounded-xl p-4 mb-6 flex items-center gap-4">
      {trackInfo.albumArtUrl && (
        <img src={trackInfo.albumArtUrl} alt={trackInfo.album || trackInfo.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-semibold text-sm truncate">{trackInfo.name}</p>
        <p className="text-text-secondary text-xs truncate">{trackInfo.artist}</p>
        {trackInfo.source === 'spotify' && <p className="text-text-muted text-xs truncate">{trackInfo.album}</p>}
      </div>
      {previewIcon && <previewIcon.Icon className="w-5 h-5 shrink-0" style={{ color: previewIcon.color }} />}
    </div>
  )
}

function SongSelection({ opponent, timeLeft, totalTime = 90, roundNum, roundLabel, onLockIn, suddenDeath = false, finals = false, genre }) {
  const [mode, setMode] = useState('search') // 'search' | 'paste'
  const [trackInfo, setTrackInfo] = useState(null)
  const [error, setError] = useState(null)

  // Paste-link mode state
  const [songLink, setSongLink] = useState('')
  const [pasteLoading, setPasteLoading] = useState(false)
  const pasteDebounceRef = useRef(null)

  // Search mode state
  const [searchPlatform, setSearchPlatform] = useState('spotify')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchDebounceRef = useRef(null)

  const handleLinkChange = (value) => {
    setSongLink(value)
    if (pasteDebounceRef.current) clearTimeout(pasteDebounceRef.current)

    const trimmed = value.trim()
    const platform = detectPlatform(trimmed)

    if (!trimmed || !platform) {
      setTrackInfo(null)
      setError(null)
      return
    }

    pasteDebounceRef.current = setTimeout(async () => {
      setPasteLoading(true)
      setError(null)
      try {
        const data = platform === 'spotify' ? await fetchSpotifyTrack(trimmed) : await fetchYouTubeTrack(trimmed)
        setTrackInfo(data)
      } catch (e) {
        setError(e.message)
        setTrackInfo(null)
      } finally {
        setPasteLoading(false)
      }
    }, 500)
  }

  const handleQueryChange = (value) => {
    setQuery(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

    const trimmed = value.trim()
    if (!trimmed) {
      setResults([])
      setError(null)
      return
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      setError(null)
      try {
        const data = searchPlatform === 'spotify' ? await searchSpotifyTracks(trimmed) : await searchYouTubeVideos(trimmed)
        setResults(data)
      } catch (e) {
        setError(e.message)
        setResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)
  }

  const switchSearchPlatform = (platform) => {
    setSearchPlatform(platform)
    setResults([])
    setError(null)
    // Re-run the current query against the new platform immediately.
    if (query.trim()) {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      setSearchLoading(true)
      const fn = platform === 'spotify' ? searchSpotifyTracks : searchYouTubeVideos
      fn(query.trim())
        .then(setResults)
        .catch((e) => setError(e.message))
        .finally(() => setSearchLoading(false))
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setTrackInfo(null)
    setError(null)
  }

  const handleLockIn = () => {
    if (trackInfo && onLockIn) onLockIn(trackInfo)
  }

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-lg mx-auto w-full">
      <span className={`inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 ${
        suddenDeath
          ? 'bg-blood/10 text-blood border border-blood/30'
          : finals
            ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30'
            : 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
      }`}>
        {finals && !suddenDeath && <span className="mr-1">👑</span>}
        {roundLabel || `Round ${roundNum}`}
      </span>

      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Pick your track</h2>
      <p className="text-text-secondary text-sm mb-3">
        You're up against <span className="text-text-primary font-semibold">{opponent.name}</span>
      </p>

      {/* The genre rule can't be enforced in code (Spotify only exposes genre on
          the artist, YouTube not at all), so it's surfaced here -- at the moment
          of choosing -- and left to the room to police with its votes. */}
      {genre && genre !== 'Any genre' && (
        <p className="mb-6 px-3 py-1.5 text-xs rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/25">
          Tonight's genre: <span className="font-semibold">{genre}</span>
        </p>
      )}

      <div className="mb-8">
        <CountdownTimer timeLeft={timeLeft} totalTime={totalTime} suddenDeath={suddenDeath} finals={finals} />
      </div>

      {/* Search vs paste-link mode toggle */}
      <div className="w-full flex gap-1.5 mb-4 p-1 bg-card/60 rounded-xl border border-text-muted/10">
        <button
          onClick={() => switchMode('search')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'search' ? 'bg-neon-blue/20 text-neon-blue' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          🔍 Search
        </button>
        <button
          onClick={() => switchMode('paste')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'paste' ? 'bg-neon-blue/20 text-neon-blue' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          🔗 Paste Link
        </button>
      </div>

      {mode === 'search' ? (
        <>
          {/* Platform toggle */}
          <div className="w-full flex gap-2 mb-3">
            {['spotify', 'youtube'].map((p) => {
              const { Icon, color } = PLATFORM_ICON[p]
              const active = searchPlatform === p
              return (
                <button
                  key={p}
                  onClick={() => switchSearchPlatform(p)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    active ? 'border-neon-blue/40 bg-neon-blue/10' : 'border-text-muted/15 hover:bg-card-hover'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className={active ? 'text-text-primary' : 'text-text-muted'}>{p === 'spotify' ? 'Spotify' : 'YouTube'}</span>
                </button>
              )
            })}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={`Search ${searchPlatform === 'spotify' ? 'Spotify' : 'YouTube'} for a song...`}
            className="w-full bg-card/60 border border-text-muted/20 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors mb-3"
          />

          {searchLoading && (
            <div className="w-full space-y-2 mb-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-10 h-10 rounded-md bg-card-hover animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-card-hover rounded w-3/4 mb-1.5 animate-pulse" />
                    <div className="h-3 bg-card-hover/60 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchLoading && results.length > 0 && (
            <div className="w-full max-h-72 overflow-y-auto space-y-1 mb-3 -mx-1 px-1">
              {results.map((track) => (
                <SearchResultRow
                  key={track.id}
                  track={track}
                  selected={trackInfo?.id === track.id && trackInfo?.source === track.source}
                  onSelect={() => setTrackInfo(track)}
                />
              ))}
            </div>
          )}

          {!searchLoading && query.trim() && results.length === 0 && !error && (
            <p className="text-text-muted text-sm text-center mb-3">No results for "{query.trim()}"</p>
          )}
        </>
      ) : (
        <div className="w-full mb-3">
          <input
            type="url"
            value={songLink}
            onChange={(e) => handleLinkChange(e.target.value)}
            placeholder="Paste a Spotify or YouTube link"
            className="w-full bg-card/60 border border-text-muted/20 text-text-primary rounded-xl px-4 py-3 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors"
          />
          {pasteLoading && (
            <div className="w-full bg-card/60 border border-text-muted/15 rounded-xl p-4 mt-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-card-hover animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-card-hover rounded w-3/4 mb-1.5 animate-pulse" />
                <div className="h-3 bg-card-hover/60 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="w-full bg-neon-pink/10 border border-neon-pink/20 rounded-xl px-4 py-3 mb-3">
          <p className="text-neon-pink text-sm">{error}</p>
        </div>
      )}

      {trackInfo && !pasteLoading && <TrackPreview trackInfo={trackInfo} />}

      <button
        onClick={handleLockIn}
        disabled={!trackInfo}
        className={`w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white transition-all duration-300 ${
          trackInfo ? 'cursor-pointer hover:shadow-[0_0_30px_rgba(0,128,255,0.3)]' : 'opacity-40 cursor-not-allowed'
        }`}
      >
        Lock In
      </button>
      <p className="text-text-muted text-xs mt-2">
        {trackInfo ? 'Ready to lock in your track!' : 'Search or paste a link to pick your track'}
      </p>
    </div>
  )
}

export default SongSelection
