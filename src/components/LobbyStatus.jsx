import { MAX_PLAYERS, MIN_PLAYERS } from '../utils/lobbyRules'

// A lobby is open (2..MAX_PLAYERS) rather than sized up front, so there's no
// "N of M" to fill -- the progress bar tracks how close the room is to full only
// as a soft indicator, and the real gate is simply "are there 2 of us yet".
function LobbyStatus({ currentCount, isHost, onStartDuel }) {
  const isFull = currentCount >= MAX_PLAYERS
  const canStart = currentCount >= MIN_PLAYERS
  const percentage = Math.min(100, (currentCount / MAX_PLAYERS) * 100)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${isFull ? 'text-neon-green' : 'text-text-secondary'}`}>
          {currentCount} {currentCount === 1 ? 'player' : 'players'} in the lobby
        </span>
        <span className="text-text-muted text-xs">
          {isFull ? 'Room full' : `room for ${MAX_PLAYERS - currentCount} more`}
        </span>
      </div>
      <div className="h-2 bg-card rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-neon-green' : 'bg-gradient-to-r from-neon-blue to-neon-purple'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        {isHost ? (
          canStart ? (
            <>
              <button
                onClick={onStartDuel}
                className="px-8 py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-green to-neon-blue text-midnight animate-glow-pulse cursor-pointer transition-all duration-300"
              >
                {currentCount > 2 ? 'Start Tournament' : 'Start Duel'}
              </button>
              {!isFull && (
                <p className="text-text-muted text-xs">Start now, or wait for more players to join.</p>
              )}
            </>
          ) : (
            <p className="text-text-muted text-sm">Waiting for at least one more player…</p>
          )
        ) : (
          <p className="text-text-muted text-sm">Waiting for the host to start…</p>
        )}
      </div>
    </div>
  )
}

export default LobbyStatus
