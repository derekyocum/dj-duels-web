import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router'
import AppBackground from '../components/AppBackground'
import PlayerSlot from '../components/PlayerSlot'
import LobbyStatus from '../components/LobbyStatus'
import LobbySettings from '../components/LobbySettings'
import HowItWorksModal from '../components/HowItWorksModal'
import AppNav from '../components/AppNav'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useDuelSocket, useDuelEvents } from '../context/DuelSocketContext'
import { PLAYER_COLORS } from '../utils/duelUtils'
import { DEFAULT_SETTINGS, MAX_PLAYERS, describeSettings } from '../utils/lobbyRules'

// How long to sit on a host's rapid setting changes before telling the server.
// Typing a theme letter by letter shouldn't be one broadcast per keystroke to
// every player in the room.
const SETTINGS_DEBOUNCE_MS = 400

function Lobby() {
  const { duelId } = useParams()
  const [searchParams] = useSearchParams()
  const urlClaimsHost = searchParams.get('host') === 'true'
  const { user } = useAuth()
  const navigate = useNavigate()

  const [players, setPlayers] = useState(() => [{
    name: user?.username ?? (urlClaimsHost ? 'You (Host)' : 'You'),
    color: PLAYER_COLORS[0],
    isHost: urlClaimsHost,
  }])
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  // Server-owned: the host edits, everyone receives. Seeded with the shared
  // defaults so the very first render matches what the server would say.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [lobbyFull, setLobbyFull] = useState(false)
  // How it works lives behind a button now (it used to be an always-on card
  // eating space above the roster), so there's no dismissal to remember.
  const [showHowTo, setShowHowTo] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // The server is the source of truth for who's host (it falls back to "first
  // joiner" when nobody's ?host=true link claims it — see GameSession.addPlayer).
  // Trust the roster once we have it; the URL flag is only an optimistic guess
  // for the very first render, before any PLAYER_JOINED has arrived.
  const me = players.find((p) => p.name === user?.username)
  const isHost = me ? me.isHost : urlClaimsHost

  const handleGameEvent = useCallback((event) => {
    switch (event.type) {
      case 'PLAYER_JOINED':
        setPlayers(event.payload.players)
        // Carries the host's rules so someone joining a lobby that was already
        // configured doesn't sit on stale defaults until the next edit.
        if (event.payload.settings) setSettings(event.payload.settings)
        break
      case 'PLAYER_LEFT':
        // Same shape as PLAYER_JOINED, and it also carries the host handoff when
        // the person who left was the host (isHost rides on each PlayerInfo).
        setPlayers(event.payload.players)
        if (event.payload.settings) setSettings(event.payload.settings)
        break
      case 'SETTINGS_UPDATED':
        setSettings(event.payload.settings)
        break
      case 'LOBBY_FULL':
        setLobbyFull(true)
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

  // Send join message as soon as the socket is connected. Send the URL's host
  // claim, not the (possibly server-corrected) derived `isHost` — this message
  // IS the claim; the server decides who actually becomes host.
  useEffect(() => {
    if (isConnected) {
      send('lobby/join', { duelId, username: user?.username, isHost: urlClaimsHost })
    }
  }, [isConnected, send, duelId, user?.username, urlClaimsHost])

  // Push the host's edits to the server, which validates them and fans them out
  // to everyone (including back to us). Debounced, and host-only: a non-host's
  // client has no editing UI, and the server would reject it anyway.
  const pendingSettings = useRef(null)
  const handleSettingsChange = useCallback((next) => {
    setSettings(next)          // optimistic, so the host's own UI feels instant
    pendingSettings.current = next
  }, [])

  useEffect(() => {
    if (!isHost || !isConnected || !pendingSettings.current) return
    const t = setTimeout(() => {
      send('lobby/settings', { duelId, settings: pendingSettings.current })
      pendingSettings.current = null
    }, SETTINGS_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [settings, isHost, isConnected, send, duelId])

  const lobbyLink = `${window.location.origin}/lobby/${duelId}`

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(lobbyLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [lobbyLink])

  // The button next to the code copies the CODE itself, not the invite link --
  // "Copy duel code" was writing the full https link, so a paste gave the URL.
  const [codeCopied, setCodeCopied] = useState(false)
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(duelId)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }, [duelId])

  const handleStartDuel = useCallback(() => {
    // Settings deliberately not sent: the server owns them now and ignores any
    // copy in this payload. Same for player1/player2 — it seeds the bracket.
    send('lobby/start', {
      duelId,
      player1: players[0],
      player2: players[1],
      allPlayers: players,
      bracket: {},
      settings: {},
      trackHistory: {},
      roundLabel: 'Round 1',
      isFinal: false,
    })
  }, [send, duelId, players])

  // Leaving is two steps: tell the server to drop us from the roster (so the
  // others see us go, and the host role is handed on if we were host), then
  // navigate away. Navigating off /lobby unmounts DuelLayout, which unmounts
  // DuelSocketProvider and deactivates the STOMP client -- that's what actually
  // kills the connection. The one tick of delay gives the leave frame a moment
  // to reach the wire before the socket goes down under it.
  const handleLeave = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    send('lobby/leave', { duelId })
    setTimeout(() => navigate('/'), 120)
  }, [leaving, send, duelId, navigate])

  // Joined players, plus ONE placeholder for "someone else could still join".
  // Rendering all MAX_PLAYERS slots would imply the room needs 7 to start.
  const slots = players.length < MAX_PLAYERS ? [...players, null] : players
  const ruleRows = describeSettings(settings)

  if (lobbyFull) {
    return (
      <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
        <AppBackground />
        <AppNav />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <span className="text-4xl">🚪</span>
          <h1 className="text-2xl font-bold text-text-primary">This lobby is full</h1>
          <p className="text-text-secondary text-sm max-w-sm">
            A duel holds up to {MAX_PLAYERS} players and this one already has {MAX_PLAYERS}.
            Ask the host to start a new one.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-8 py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white cursor-pointer"
          >
            Back to Home
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

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
              onClick={handleCopyCode}
              className="p-2.5 rounded-lg bg-card hover:bg-card-hover border border-text-muted/20 text-text-secondary hover:text-neon-blue transition-colors cursor-pointer"
              title="Copy duel code"
            >
              {codeCopied ? '✓' : '📋'}
            </button>
            {/* Everyone gets this button now -- the host to edit the rules, and
                everyone else to read them. */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-lg bg-card hover:bg-card-hover border border-text-muted/20 text-text-secondary hover:text-neon-blue transition-colors cursor-pointer"
              title={isHost ? 'Lobby settings' : "View the host's rules"}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* House rules, visible to the whole room rather than just the host */}
        <div className="mb-6 w-full max-w-md bg-card/50 border border-neon-purple/20 rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-muted text-[10px] uppercase tracking-widest font-semibold">
              {isHost ? 'Your rules' : "Host's rules"}
            </span>
            <button
              onClick={() => setShowSettings(true)}
              className="text-neon-blue/80 hover:text-neon-blue text-[11px] font-semibold cursor-pointer"
            >
              {isHost ? 'Edit' : 'View all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {ruleRows.map((row) => (
              <span key={row.label} className="text-xs">
                <span className="text-text-muted">{row.label}: </span>
                <span className="text-text-primary font-medium">{row.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Two low-emphasis actions, side by side so neither competes with the
            Start button below. */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setShowHowTo(true)}
            className="px-4 py-1.5 text-xs font-semibold rounded-full border border-neon-blue/25 text-neon-blue/90 hover:bg-neon-blue/10 hover:text-neon-blue transition-colors cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="px-4 py-1.5 text-xs font-semibold rounded-full border border-text-muted/25 text-text-muted hover:text-neon-pink hover:border-neon-pink/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {leaving ? 'Leaving…' : 'Leave lobby'}
          </button>
        </div>

        <div className="mb-10 w-full max-w-md">
          <LobbyStatus currentCount={players.length} isHost={isHost} onStartDuel={handleStartDuel} />
        </div>

        <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl mb-10">
          {slots.map((player, i) => (
            <PlayerSlot key={i} player={player} />
          ))}
        </div>

        <p className="text-text-muted text-xs mb-10 text-center">
          Connect Spotify or YouTube in your{' '}
          <Link to="/profile" className="text-neon-blue hover:text-neon-blue/80 transition-colors">
            Profile
          </Link>
        </p>

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

      <Footer />

      <LobbySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        readOnly={!isHost}
      />

      <HowItWorksModal isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
    </div>
  )
}

export default Lobby
