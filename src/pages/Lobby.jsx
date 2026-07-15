import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import PlayerSlot from '../components/PlayerSlot'
import LobbyStatus from '../components/LobbyStatus'
import PlatformButton from '../components/PlatformButton'
import LobbySettings from '../components/LobbySettings'
import AppNav from '../components/AppNav'
import { useAuth } from '../context/AuthContext'
import { useDuelSocket, useDuelEvents } from '../context/DuelSocketContext'
import { PLAYER_COLORS } from '../utils/duelUtils'

const DEFAULT_SETTINGS = {
  title: '',
  timeLimit: 90,
  songLengthLimit: null,
  genre: 'Any genre',
  tiebreaker: 'none',
}

const PLATFORMS = [
  { name: 'Spotify', platform: 'spotify' },
  { name: 'YouTube', platform: 'youtube' },
  { name: 'Apple Music', platform: 'apple' },
]

function Lobby() {
  const { duelId } = useParams()
  const [searchParams] = useSearchParams()
  const isHost = searchParams.get('host') === 'true'
  const urlMaxPlayers = parseInt(searchParams.get('players') || '2', 10)
  const [maxPlayers, setMaxPlayers] = useState(urlMaxPlayers)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [players, setPlayers] = useState(() => [{
    name: user?.username ?? (isHost ? 'You (Host)' : 'You'),
    color: PLAYER_COLORS[0],
    isHost,
  }])
  const [copied, setCopied] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState({})
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const handleGameEvent = useCallback((event) => {
    switch (event.type) {
      case 'PLAYER_JOINED':
        setPlayers(event.payload.players)
        if (event.payload.maxPlayers) setMaxPlayers(event.payload.maxPlayers)
        break
      case 'GAME_STARTED': {
        const p = event.payload
        navigate(`/duel/${duelId}/round/1`, {
          state: {
            players: p.allPlayers,
            allPlayers: p.allPlayers,
            settings: p.settings,
            bracket: p.bracket,
            trackHistory: p.trackHistory,
            player1: p.player1,
            player2: p.player2,
            roundLabel: p.roundLabel,
            faceoffEndsAt: p.faceoffEndsAt,
          },
        })
        break
      }
      case 'SESSION_EXPIRED':
      case 'SESSION_CLOSED':
        navigate('/')
        break
      default:
        break
    }
  }, [navigate, duelId])

  const { send, isConnected } = useDuelSocket()
  useDuelEvents(handleGameEvent)

  // Send join message as soon as the socket is connected
  useEffect(() => {
    if (isConnected) {
      send('lobby/join', { duelId, username: user?.username, isHost, maxPlayers: urlMaxPlayers })
    }
  }, [isConnected, send, duelId, user?.username, isHost, urlMaxPlayers])

  const lobbyLink = `${window.location.origin}/lobby/${duelId}?players=${maxPlayers}`

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(lobbyLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [lobbyLink])

  const handleTogglePlatform = useCallback((platform) => {
    setConnectedPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }))
  }, [])

  const handleStartDuel = useCallback(() => {
    send('lobby/start', {
      duelId,
      player1: players[0],
      player2: players[1],
      allPlayers: players,
      bracket: {},
      settings,
      trackHistory: {},
      roundLabel: 'Round 1',
      isFinal: false,
    })
  }, [send, duelId, players, settings])

  const slots = Array.from({ length: maxPlayers }, (_, i) => players[i] || null)

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

      <AppNav right={
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green' : 'bg-text-muted/40'}`} />
          <span className="text-text-muted text-xs">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      } />

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="text-text-secondary text-sm font-medium uppercase tracking-widest">Duel Code</span>
          <div className="flex items-center gap-3">
            <span className="bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-xl px-6 py-3 text-2xl font-mono tracking-widest font-bold">
              {duelId}
            </span>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-lg bg-card hover:bg-card-hover border border-text-muted/20 text-text-secondary hover:text-neon-blue transition-colors cursor-pointer"
              title="Copy duel code"
            >
              {copied ? '✓' : '📋'}
            </button>
            {isHost && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-lg bg-card hover:bg-card-hover border border-text-muted/20 text-text-secondary hover:text-neon-blue transition-colors cursor-pointer"
                title="Lobby settings"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>

        {settings.title && (
          <div className="mb-6 flex items-center gap-2 px-5 py-3 bg-neon-purple/10 border border-neon-purple/25 rounded-2xl max-w-md w-full">
            <span className="text-lg">🎵</span>
            <div className="flex flex-col min-w-0">
              <span className="text-text-muted text-[10px] uppercase tracking-widest font-medium">Tonight&apos;s Theme</span>
              <span className="text-text-primary font-semibold text-sm truncate">{settings.title}</span>
            </div>
            {settings.genre && settings.genre !== 'Any genre' && (
              <span className="ml-auto shrink-0 text-xs text-neon-purple border border-neon-purple/30 bg-neon-purple/10 px-2.5 py-1 rounded-full">
                {settings.genre}
              </span>
            )}
          </div>
        )}

        <div className="mb-10 w-full max-w-md">
          <LobbyStatus currentCount={players.length} maxCount={maxPlayers} onStartDuel={handleStartDuel} />
        </div>

        <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl mb-10">
          {slots.map((player, i) => (
            <PlayerSlot key={i} player={player} />
          ))}
        </div>

        <div className="bg-card/60 border border-text-muted/15 rounded-xl p-5 max-w-md w-full mb-10">
          <h3 className="text-text-primary font-semibold text-sm mb-3 text-center">Connect Your Music</h3>
          <div className="space-y-2">
            {PLATFORMS.map((p) => (
              <PlatformButton
                key={p.platform}
                name={p.name}
                platform={p.platform}
                connected={!!connectedPlatforms[p.platform]}
                onToggle={() => handleTogglePlatform(p.platform)}
              />
            ))}
          </div>
        </div>

        {isHost && (
          <div className="bg-card/60 border border-text-muted/15 rounded-xl p-5 max-w-md w-full text-center">
            <p className="text-text-secondary text-sm mb-3">Share this link with your friends</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-midnight/80 border border-text-muted/20 rounded-lg px-4 py-2.5 text-text-muted text-sm font-mono truncate">
                {lobbyLink}
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 px-4 py-2.5 text-sm font-semibold rounded-lg bg-neon-blue/15 text-neon-blue hover:bg-neon-blue/25 border border-neon-blue/30 transition-colors cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center py-6 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>

      <LobbySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  )
}

export default Lobby
