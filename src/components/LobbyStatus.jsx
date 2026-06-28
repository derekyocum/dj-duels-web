function LobbyStatus({ currentCount, maxCount, onStartDuel }) {
  const isReady = currentCount === maxCount
  const percentage = (currentCount / maxCount) * 100

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${isReady ? 'text-neon-green' : 'text-text-secondary'}`}>
          {isReady ? 'All players are here!' : `${currentCount} of ${maxCount} players joined`}
        </span>
      </div>
      <div className="h-2 bg-card rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-neon-green' : 'bg-gradient-to-r from-neon-blue to-neon-purple'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isReady && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onStartDuel}
            className="px-8 py-3 text-base font-bold rounded-full bg-gradient-to-r from-neon-green to-neon-blue text-midnight animate-glow-pulse cursor-pointer transition-all duration-300"
          >
            Start Duel
          </button>
        </div>
      )}
    </div>
  )
}

export default LobbyStatus
