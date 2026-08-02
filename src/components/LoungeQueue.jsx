import { useState, useRef } from 'react'
import SearchResultRow from './SearchResultRow'
import { detectPlatform, PLATFORM_ICON } from '../utils/trackPlatforms'
import { fetchSpotifyTrack, fetchYouTubeTrack, searchSpotifyTracks, searchYouTubeVideos } from '../utils/api'

/**
 * The shared queue plus the "add something" flow. Reuses the same
 * search/paste-a-link affordances the duel's SongSelection has (via
 * trackPicking.jsx) but with the lounge's warmer accent and no countdown or
 * lock-in pressure — you're adding to a queue, not committing to a battle.
 */
function LoungeQueue({ queue, onAdd, onRemove }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('search') // 'search' | 'paste'
  const [platform, setPlatform] = useState('spotify')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [link, setLink] = useState('')
  const [error, setError] = useState(null)
  const searchDebounce = useRef(null)
  const pasteDebounce = useRef(null)

  const runSearch = (which, text) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    const trimmed = text.trim()
    if (!trimmed) {
      setResults([])
      return
    }
    searchDebounce.current = setTimeout(async () => {
      setSearching(true)
      setError(null)
      try {
        const fn = which === 'spotify' ? searchSpotifyTracks : searchYouTubeVideos
        setResults(await fn(trimmed))
      } catch (e) {
        setError(e.message)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  const handleQueryChange = (value) => {
    setQuery(value)
    runSearch(platform, value)
  }

  const switchPlatform = (next) => {
    setPlatform(next)
    runSearch(next, query)
  }

  const handleLinkChange = (value) => {
    setLink(value)
    if (pasteDebounce.current) clearTimeout(pasteDebounce.current)
    const trimmed = value.trim()
    const detected = detectPlatform(trimmed)
    if (!trimmed || !detected) {
      setError(null)
      return
    }
    pasteDebounce.current = setTimeout(async () => {
      setError(null)
      try {
        const track = detected === 'spotify' ? await fetchSpotifyTrack(trimmed) : await fetchYouTubeTrack(trimmed)
        add(track)
        setLink('')
      } catch (e) {
        setError(e.message)
      }
    }, 500)
  }

  const add = (track) => {
    onAdd?.(track)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="rounded-3xl border border-text-muted/15 bg-card/40 overflow-hidden">
      <div className="px-6 py-4 border-b border-text-muted/10 flex items-center justify-between">
        <h2 className="text-text-primary font-semibold text-sm">
          Up next {queue.length > 0 && <span className="text-text-muted font-normal">· {queue.length}</span>}
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-1.5 text-xs font-semibold rounded-full bg-ember/15 text-ember border border-ember/30 hover:bg-ember/25 transition-colors cursor-pointer"
        >
          {open ? 'Close' : '+ Add a track'}
        </button>
      </div>

      {open && (
        <div className="px-6 py-4 border-b border-text-muted/10">
          <div className="flex gap-1.5 mb-3 p-1 bg-card/60 rounded-xl border border-text-muted/10">
            {[['search', '🔍 Search'], ['paste', '🔗 Paste link']].map(([value, label]) => (
              <button
                key={value}
                onClick={() => { setMode(value); setError(null) }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  mode === value ? 'bg-ember/20 text-ember' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'search' ? (
            <>
              <div className="flex gap-2 mb-3">
                {['spotify', 'youtube'].map((p) => {
                  const { Icon, color } = PLATFORM_ICON[p]
                  const active = platform === p
                  return (
                    <button
                      key={p}
                      onClick={() => switchPlatform(p)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        active ? 'border-ember/40 bg-ember/10 text-text-primary' : 'border-text-muted/15 text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                      {p === 'spotify' ? 'Spotify' : 'YouTube'}
                    </button>
                  )
                })}
              </div>
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={`Search ${platform === 'spotify' ? 'Spotify' : 'YouTube'}…`}
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-card border border-text-muted/20 text-text-primary rounded-xl px-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-ember/50 transition-colors"
              />
              {searching && <p className="text-text-muted text-xs mt-3">Searching…</p>}
              {!searching && results.length > 0 && (
                <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
                  {results.map((track) => (
                    <SearchResultRow key={track.id} track={track} accent="ember" onSelect={() => add(track)} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <input
              value={link}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="Paste a Spotify or YouTube link"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-card border border-text-muted/20 text-text-primary rounded-xl px-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-ember/50 transition-colors"
            />
          )}

          {error && <p className="text-neon-pink text-xs mt-3">{error}</p>}
        </div>
      )}

      {queue.length === 0 ? (
        <p className="px-6 py-8 text-text-muted text-sm text-center">
          Queue&apos;s empty — add something and it plays for everyone.
        </p>
      ) : (
        <ul>
          {queue.map((entry) => {
            const icon = PLATFORM_ICON[entry.track?.source]
            return (
              <li key={entry.id} className="flex items-center gap-3 px-6 py-3 border-t border-text-muted/5">
                {entry.track?.albumArtUrl ? (
                  <img src={entry.track.albumArtUrl} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-card-hover shrink-0 flex items-center justify-center">🎵</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{entry.track?.name}</p>
                  <p className="text-text-muted text-xs truncate">{entry.track?.artist} · {entry.addedBy}</p>
                </div>
                {icon && <icon.Icon className="w-4 h-4 shrink-0" style={{ color: icon.color }} />}
                <button
                  onClick={() => onRemove?.(entry.id)}
                  className="shrink-0 text-text-muted hover:text-neon-pink text-xs font-medium transition-colors cursor-pointer"
                  aria-label={`Remove ${entry.track?.name}`}
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default LoungeQueue
