function LobbyStatus({ currentCount, maxCount, isHost, onStartDuel }) {
  const isFull = currentCount === maxCount
  // A tournament needs at least two players; the host can start as soon as that's
  // met (they don't have to wait for every slot to fill). 3+ players => a bracket.
  const canStart = currentCount >= 2
  const percentage = (currentCount / maxCount) * 100

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${isFull ? 'text-neon-green' : 'text-text-secondary'}`}>
          {isFull ? 'All players are here!' : `${currentCount} of ${maxCount} players joined`}
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
