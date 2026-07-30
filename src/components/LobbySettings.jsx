import { useEffect } from 'react'
import {
  TIME_LIMIT_OPTIONS,
  SONG_LENGTH_OPTIONS,
  TIEBREAKER_OPTIONS,
  GENRE_OPTIONS,
  describeSettings,
} from '../utils/lobbyRules'

function SettingSection({ label, hint, children }) {
  return (
    <div>
      <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">{label}</label>
      {children}
      {hint && <p className="text-text-muted/70 text-[11px] mt-1.5">{hint}</p>}
    </div>
  )
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value
        const optLabel = typeof opt === 'string' ? opt : opt.label
        const isSelected = value === optValue

        return (
          <button
            key={optLabel}
            onClick={() => onChange(optValue)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40'
                : 'bg-card/80 text-text-muted border border-transparent hover:bg-card-hover hover:text-text-secondary'
            }`}
          >
            {optLabel}
          </button>
        )
      })}
    </div>
  )
}

/**
 * What everyone who isn't the host sees. Same rules, no controls -- the point of
 * moving settings onto the server was so the rest of the room can actually read
 * them before the duel starts, rather than finding out mid-match.
 */
function ReadOnlyRules({ settings }) {
  return (
    <div className="divide-y divide-text-muted/10 rounded-xl border border-text-muted/15 overflow-hidden">
      {describeSettings(settings).map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="text-text-muted text-sm">{row.label}</span>
          <span className="text-text-primary text-sm font-medium text-right">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function LobbySettings({ isOpen, onClose, settings, onSettingsChange, readOnly = false }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const update = (key, value) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-surface border border-card rounded-2xl p-6 max-w-md w-full relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg">⚙️</span>
          <h2 className="text-lg font-bold text-text-primary">
            {readOnly ? "Host's Rules" : 'Lobby Settings'}
          </h2>
        </div>

        {readOnly ? (
          <>
            <ReadOnlyRules settings={settings} />
            <div className="mt-6 pt-4 border-t border-text-muted/15">
              <p className="text-text-muted text-xs text-center">
                Only the host can change these. Updates appear here live.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-5">
              <SettingSection label="Duel Theme">
                <input
                  type="text"
                  value={settings.title || ''}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="e.g. Best 90s Banger, Saturday Night Vibes..."
                  maxLength={48}
                  className="w-full bg-midnight/80 border border-text-muted/20 text-text-primary rounded-xl px-4 py-2.5 text-sm placeholder:text-text-muted/50 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:outline-none transition-colors"
                />
              </SettingSection>

              <SettingSection label="Song Selection Time" hint="How long each DJ has to pick a track.">
                <OptionGrid
                  options={TIME_LIMIT_OPTIONS}
                  value={settings.timeLimit}
                  onChange={(v) => update('timeLimit', v)}
                />
              </SettingSection>

              <SettingSection label="Song Play Time" hint="How long each track plays on stage before the room's votes close.">
                <OptionGrid
                  options={SONG_LENGTH_OPTIONS}
                  value={settings.songLengthLimit ?? null}
                  onChange={(v) => update('songLengthLimit', v)}
                />
              </SettingSection>

              <SettingSection label="Genre" hint="Shown to everyone as the house rule — it's on the room to keep each other honest.">
                <OptionGrid
                  options={GENRE_OPTIONS}
                  value={settings.genre}
                  onChange={(v) => update('genre', v)}
                />
              </SettingSection>

              <SettingSection
                label="Tiebreaker"
                hint={
                  settings.tiebreaker === 'fewest-dislikes'
                    ? 'A tie goes to whichever track took fewer 🗑️.'
                    : 'A tie sends both DJs back for a fresh pick and another vote.'
                }
              >
                <OptionGrid
                  options={TIEBREAKER_OPTIONS}
                  value={settings.tiebreaker}
                  onChange={(v) => update('tiebreaker', v)}
                />
              </SettingSection>
            </div>

            <div className="mt-6 pt-4 border-t border-text-muted/15">
              <p className="text-text-muted text-xs text-center">
                Everyone in the lobby sees these. Changes lock once the duel starts.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LobbySettings
