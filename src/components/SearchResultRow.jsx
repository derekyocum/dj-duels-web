import { PLATFORM_ICON } from '../utils/trackPlatforms'

/**
 * One track in a search result list. Shared by the duel's SongSelection and the
 * lounge's queue picker so the two don't keep drifting copies of the same row.
 *
 * @param accent tailwind color name for the selected state — the duel keeps its
 *               neon-blue, the lounge gets its warmer ember.
 */
function SearchResultRow({ track, selected, onSelect, accent = 'neon-blue' }) {
  const { Icon, color } = PLATFORM_ICON[track.source]
  const selectedClass = accent === 'ember'
    ? 'bg-ember/15 border border-ember/40'
    : 'bg-neon-blue/15 border border-neon-blue/40'

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
        selected ? selectedClass : 'border border-transparent hover:bg-card-hover'
      }`}
    >
      {track.albumArtUrl ? (
        <img src={track.albumArtUrl} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-md bg-card-hover shrink-0 flex items-center justify-center text-text-muted text-xs">🎵</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{track.name}</p>
        <p className="text-text-muted text-xs truncate">{track.artist}</p>
      </div>
      <Icon className="w-4 h-4 shrink-0" style={{ color }} />
    </button>
  )
}

export default SearchResultRow
