import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'
import { DEMO_TRACKS } from '../utils/demoData'

const COLOR_BG = {
  'neon-blue': 'bg-neon-blue/20',
  'neon-pink': 'bg-neon-pink/20',
  'neon-purple': 'bg-neon-purple/20',
  'neon-green': 'bg-neon-green/20',
  'neon-yellow': 'bg-neon-yellow/20',
}

const COLOR_BORDER = {
  'neon-blue': 'border-neon-blue/50',
  'neon-pink': 'border-neon-pink/50',
  'neon-purple': 'border-neon-purple/50',
  'neon-green': 'border-neon-green/50',
  'neon-yellow': 'border-neon-yellow/50',
}

const COLOR_TEXT = {
  'neon-blue': 'text-neon-blue',
  'neon-pink': 'text-neon-pink',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
  'neon-yellow': 'text-neon-yellow',
}

const COLOR_GLOW = {
  'neon-blue': 'shadow-[0_0_40px_rgba(0,212,255,0.25)]',
  'neon-pink': 'shadow-[0_0_40px_rgba(255,45,149,0.25)]',
  'neon-purple': 'shadow-[0_0_40px_rgba(179,71,255,0.25)]',
  'neon-green': 'shadow-[0_0_40px_rgba(57,255,20,0.25)]',
  'neon-yellow': 'shadow-[0_0_40px_rgba(255,240,31,0.25)]',
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function AudienceMember({ player, isCurrentPerformer }) {
  const bg = COLOR_BG[player.color] || COLOR_BG['neon-blue']
  const border = COLOR_BORDER[player.color] || COLOR_BORDER['neon-blue']
  const text = COLOR_TEXT[player.color] || COLOR_TEXT['neon-blue']

  return (
    <div className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isCurrentPerformer ? 'scale-110' : 'opacity-60'}`}>
      <div className={`w-10 h-10 rounded-full ${bg} border-2 ${border} flex items-center justify-center ${isCurrentPerformer ? 'ring-2 ring-neon-blue/40' : ''}`}>
        <span className={`${text} font-bold text-sm`}>{player.name.charAt(0)}</span>
      </div>
      <span className="text-text-muted text-xs truncate max-w-[60px]">{player.name}</span>
    </div>
  )
}

function Stage() {
  const { duelId, roundNum } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    player1, player2, track1, track2,
    allPlayers = [], bracket, trackHistory = {},
    roundLabel, isFinal,
  } = location.state || {}
  const round = parseInt(roundNum, 10)

  const [phase, setPhase] = useState('intro')
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [vote, setVote] = useState(null)
  const [votes, setVotes] = useState({ up: 0, down: 0 })
  const [playerVotes, setPlayerVotes] = useState({
    player1: { up: 0, down: 0 },
    player2: { up: 0, down: 0 },
  })

  const tracks = [
    { track: track1, player: player1, key: 'player1' },
    { track: track2, player: player2, key: 'player2' },
  ]
  const current = tracks[currentTrackIndex]

  useEffect(() => {
    const timer = setTimeout(() => setPhase('playing'), 1500)
    return () => clearTimeout(timer)
  }, [])

  function handleVote(direction) {
    if (vote) return
    setVote(direction)
    setVotes((prev) => ({ ...prev, [direction]: prev[direction] + 1 }))
  }

  function handleNext() {
    const updatedPlayerVotes = {
      ...playerVotes,
      [current.key]: {
        up: playerVotes[current.key].up + votes.up,
        down: playerVotes[current.key].down + votes.down,
      },
    }
    setPlayerVotes(updatedPlayerVotes)

    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex((i) => i + 1)
      setVote(null)
      setVotes({ up: 0, down: 0 })
      setPhase('intro')
      setTimeout(() => setPhase('playing'), 1500)
    } else {
      setPhase('finished')
      const finalVotes = updatedPlayerVotes
      setTimeout(() => {
        const p1Fire = finalVotes.player1.up
        const p2Fire = finalVotes.player2.up
        const winner = p1Fire >= p2Fire ? player1 : player2
        const loser = p1Fire >= p2Fire ? player2 : player1
        const winnerVotes = p1Fire >= p2Fire ? finalVotes.player1 : finalVotes.player2
        const loserVotes = p1Fire >= p2Fire ? finalVotes.player2 : finalVotes.player1
        const winnerTrack = p1Fire >= p2Fire ? track1 : track2

        const newTrackHistory = { ...trackHistory }
        if (!newTrackHistory[winner.name]) newTrackHistory[winner.name] = []
        newTrackHistory[winner.name] = [...newTrackHistory[winner.name], winnerTrack]

        let nextAction, nextState

        if (isFinal) {
          nextAction = 'champion'
        } else if (bracket && bracket.semifinals[1] && !bracket.results[1]) {
          const sf2 = bracket.semifinals[1]
          const sf2Track1 = DEMO_TRACKS[sf2.player1.name]?.[0]
          const sf2Track2 = DEMO_TRACKS[sf2.player2.name]?.[0]
          const sf2P1Fire = Math.floor(Math.random() * 5) + 1
          const sf2P2Fire = Math.floor(Math.random() * 5) + 1
          const sf2Winner = sf2P1Fire >= sf2P2Fire ? sf2.player1 : sf2.player2
          const sf2Loser = sf2P1Fire >= sf2P2Fire ? sf2.player2 : sf2.player1
          const sf2WinnerVotes = { up: Math.max(sf2P1Fire, sf2P2Fire), down: Math.floor(Math.random() * 3) }
          const sf2LoserVotes = { up: Math.min(sf2P1Fire, sf2P2Fire), down: Math.floor(Math.random() * 4) + 1 }
          const sf2WinnerTrack = sf2P1Fire >= sf2P2Fire ? sf2Track1 : sf2Track2

          const sf2TrackHistory = { ...newTrackHistory }
          if (!sf2TrackHistory[sf2Winner.name]) sf2TrackHistory[sf2Winner.name] = []
          sf2TrackHistory[sf2Winner.name] = [...sf2TrackHistory[sf2Winner.name], sf2WinnerTrack]

          const updatedBracket = {
            ...bracket,
            results: [{ winner, loser }, { winner: sf2Winner, loser: sf2Loser }],
          }

          nextAction = 'auto-semifinal'
          nextState = {
            winner: sf2Winner,
            loser: sf2Loser,
            winnerVotes: sf2WinnerVotes,
            loserVotes: sf2LoserVotes,
            roundLabel: 'Semifinal 2',
            bracket: updatedBracket,
            trackHistory: sf2TrackHistory,
            allPlayers,
            nextAction: 'faceoff',
            nextState: {
              roundNum: round + 2,
              players: allPlayers,
              bracket: updatedBracket,
              trackHistory: sf2TrackHistory,
              player1: winner,
              player2: sf2Winner,
              isFinal: true,
              roundLabel: 'Final',
              allPlayers,
            },
          }
        }

        navigate(`/duel/${duelId}/round/${roundNum}/winner`, {
          state: {
            winner, loser,
            winnerVotes, loserVotes,
            roundLabel: roundLabel || `Semifinal ${round}`,
            bracket, trackHistory: newTrackHistory, allPlayers,
            nextAction, nextState,
          },
        })
      }, 2000)
    }
  }

  const color = current?.player?.color || 'neon-blue'
  const textClass = COLOR_TEXT[color] || COLOR_TEXT['neon-blue']
  const borderClass = COLOR_BORDER[color] || COLOR_BORDER['neon-blue']
  const glowClass = COLOR_GLOW[color] || COLOR_GLOW['neon-blue']
  const bgClass = COLOR_BG[color] || COLOR_BG['neon-blue']

  return (
    <div className="relative min-h-svh flex flex-col overflow-x-hidden bg-gradient-to-b from-[#050510] via-[#060614] to-[#050510]">
      <MusicNotes />

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${phase === 'playing' ? 'opacity-100' : 'opacity-30'}`}>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/6 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/5 rounded-full blur-[120px]" />
      </div>

      <div className={`absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-1000 ${phase === 'playing' ? 'opacity-100' : 'opacity-0'}`} />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>
        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
          {roundLabel || `Round ${round}`}
        </span>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4">
        {phase === 'finished' ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl animate-pulse">⚡</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Tallying votes...</h2>
          </div>
        ) : (
          <>
            <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ${phase === 'intro' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className={`w-10 h-10 rounded-full ${bgClass} border-2 ${borderClass} flex items-center justify-center`}>
                <span className={`${textClass} font-bold text-sm`}>{current?.player?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className={`${textClass} font-bold text-sm`}>{current?.player?.name}'s pick</p>
                <p className="text-text-muted text-xs">Track {currentTrackIndex + 1} of {tracks.length}</p>
              </div>
            </div>

            <div className={`transition-all duration-700 w-full max-w-2xl mx-auto ${phase === 'intro' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {current?.track?.source === 'youtube' && current?.track?.videoId ? (
                <div className={`rounded-2xl overflow-hidden ${glowClass} mx-auto mb-6`}>
                  <iframe
                    src={`https://www.youtube.com/embed/${current.track.videoId}?autoplay=1&end=300`}
                    title={current.track.name}
                    className="w-full aspect-video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : current?.track?.id ? (
                <div className={`rounded-2xl overflow-hidden ${glowClass} mx-auto mb-6 max-w-3xl`}>
                  <iframe
                    src={`https://open.spotify.com/embed/track/${current.track.id}?theme=0&utm_source=generator`}
                    title={current.track.name}
                    className="w-full h-[500px]"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              ) : null}

              <div className="text-center mb-8">
                <h2 className={`${textClass} font-bold text-2xl md:text-3xl mb-1`}>{current?.track?.name}</h2>
                <p className="text-text-secondary text-lg">{current?.track?.artist}</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  {current?.track?.source === 'youtube' ? (
                    <p className="text-text-muted text-sm">5:00 limit</p>
                  ) : (
                    <>
                      <p className="text-text-muted text-sm">{current?.track?.album}</p>
                      {current?.track?.durationMs && (
                        <>
                          <span className="text-text-muted/30">·</span>
                          <span className="text-text-muted text-sm">{formatDuration(current.track.durationMs)}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {phase === 'playing' && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleVote('up')}
                    disabled={!!vote}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 ${
                      vote === 'up'
                        ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
                        : vote
                          ? 'border-text-muted/15 text-text-muted/40 cursor-not-allowed'
                          : 'border-neon-green/30 text-neon-green hover:bg-neon-green/10 cursor-pointer'
                    }`}
                  >
                    <span className="text-lg">🔥</span>
                    <span className="font-semibold text-sm">{votes.up}</span>
                  </button>
                  <button
                    onClick={() => handleVote('down')}
                    disabled={!!vote}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 ${
                      vote === 'down'
                        ? 'bg-neon-pink/20 border-neon-pink/50 text-neon-pink'
                        : vote
                          ? 'border-text-muted/15 text-text-muted/40 cursor-not-allowed'
                          : 'border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 cursor-pointer'
                    }`}
                  >
                    <span className="text-lg">🗑️</span>
                    <span className="font-semibold text-sm">{votes.down}</span>
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  className="px-6 py-2 text-sm font-semibold rounded-full border border-text-muted/30 text-text-muted hover:text-text-secondary hover:border-text-muted/50 transition-all duration-200 cursor-pointer"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <div className="relative z-10 border-t border-text-muted/10 px-6 py-4">
        <div className="flex items-center justify-center gap-5">
          {allPlayers.map((p, i) => (
            <AudienceMember
              key={i}
              player={p}
              isCurrentPerformer={p.name === current?.player?.name}
            />
          ))}
        </div>
      </div>

      <footer className="relative z-10 text-center py-4 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>
    </div>
  )
}

export default Stage
