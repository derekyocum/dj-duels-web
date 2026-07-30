// The house rules, in one place. These lists mirror the server's whitelist in
// GameController (ALLOWED_TIME_LIMITS / ALLOWED_SONG_LENGTHS / ALLOWED_GENRES /
// ALLOWED_TIEBREAKERS) -- it validates every incoming value and silently drops
// anything it doesn't recognise, so an option added here without adding it there
// would just get thrown away. Keep the two in sync.

/** Matches GameSession.MAX_PLAYERS. A lobby is open from 2 up to this. */
export const MAX_PLAYERS = 7

/** Minimum roster the server will start a tournament with. */
export const MIN_PLAYERS = 2

export const DEFAULT_SETTINGS = {
  title: '',
  timeLimit: 90,
  songLengthLimit: null,
  genre: 'Any genre',
  tiebreaker: 'sudden-death',
}

export const TIME_LIMIT_OPTIONS = [
  { label: '60 seconds', value: 60 },
  { label: '90 seconds', value: 90 },
  { label: '2 minutes', value: 120 },
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 },
]

// "No limit" is a real choice, but the stage still needs a finite deadline to
// advance a round when votes don't all arrive -- the server falls back to 90s.
export const SONG_LENGTH_OPTIONS = [
  { label: '90s (default)', value: null },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '2 minutes', value: 120 },
  { label: '3 minutes', value: 180 },
]

export const TIEBREAKER_OPTIONS = [
  { label: 'Sudden death', value: 'sudden-death' },
  { label: 'Fewest 🗑️ wins', value: 'fewest-dislikes' },
]

export const GENRE_OPTIONS = [
  'Any genre',
  'Hip-Hop / Rap',
  'Pop',
  'R&B / Soul',
  'Rock',
  'Electronic / EDM',
  'Country',
  'Latin',
  'Jazz',
  'Classical',
  'Indie / Alternative',
]

const labelFrom = (options, value) =>
  options.find((o) => o.value === value)?.label ?? null

/**
 * The rules as short human-readable rows, for the read-only view every player
 * (host or not) sees. Theme and genre are omitted when unset rather than shown
 * as "none" -- an absent row reads as "no rule here", which is exactly right.
 * The timing and tiebreak rows always apply, so they always show.
 */
export function describeSettings(settings = {}) {
  const rows = []
  if (settings.title) rows.push({ label: 'Theme', value: settings.title })
  if (settings.genre && settings.genre !== 'Any genre') {
    rows.push({ label: 'Genre', value: settings.genre })
  }
  rows.push({
    label: 'Pick time',
    value: labelFrom(TIME_LIMIT_OPTIONS, settings.timeLimit ?? 90) ?? '90 seconds',
  })
  rows.push({
    label: 'Song play time',
    value: labelFrom(SONG_LENGTH_OPTIONS, settings.songLengthLimit ?? null) ?? '90s (default)',
  })
  rows.push({
    label: 'Tiebreaker',
    value: labelFrom(TIEBREAKER_OPTIONS, settings.tiebreaker ?? 'sudden-death') ?? 'Sudden death',
  })
  return rows
}
