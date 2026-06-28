import { useEffect } from 'react'

const SONG_LENGTH_OPTIONS = [
  { label: 'No limit', value: null },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '2 minutes', value: 120 },
  { label: '3 minutes', value: 180 },
]

const TIEBREAKER_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Sudden death round', value: 'sudden-death' },
  { label: 'Host decides', value: 'host-decides' },
  { label: 'Random pick', value: 'random' },
]

const TIME_LIMIT_OPTIONS = [
  { label: '60 seconds', value: 60 },
  { label: '90 seconds', value: 90 },
  { label: '2 minutes', value: 120 },
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 },
]

const GENRE_OPTIONS = [
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

function SettingSection({ label, children }) {
  return (
    <div>
      <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">{label}</label>
      {children}
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

function LobbySettings({ isOpen, onClose, settings, onSettingsChange }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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
          <h2 className="text-lg font-bold text-text-primary">Lobby Settings</h2>
        </div>

        <div className="space-y-5">
          <SettingSection label="Song Selection Time">
            <OptionGrid
              options={TIME_LIMIT_OPTIONS}
              value={settings.timeLimit}
              onChange={(v) => update('timeLimit', v)}
            />
          </SettingSection>

          <SettingSection label="Song Length Limit">
            <OptionGrid
              options={SONG_LENGTH_OPTIONS}
              value={settings.songLengthLimit}
              onChange={(v) => update('songLengthLimit', v)}
            />
          </SettingSection>

          <SettingSection label="Genre">
            <OptionGrid
              options={GENRE_OPTIONS}
              value={settings.genre}
              onChange={(v) => update('genre', v)}
            />
          </SettingSection>

          <SettingSection label="Tiebreaker">
            <OptionGrid
              options={TIEBREAKER_OPTIONS}
              value={settings.tiebreaker}
              onChange={(v) => update('tiebreaker', v)}
            />
          </SettingSection>
        </div>

        <div className="mt-6 pt-4 border-t border-text-muted/15">
          <p className="text-text-muted text-xs text-center">All settings are optional and can be changed before starting the duel</p>
        </div>
      </div>
    </div>
  )
}

export default LobbySettings
