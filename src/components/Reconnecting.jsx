import MusicNotes from './MusicNotes'

// Shown when a game page mounts without its state (reconnect / direct URL) while
// we wait for the server snapshot to route + rehydrate us. Replaces the old
// instant bounce to `/`.
function Reconnecting() {
  return (
    <div className="relative min-h-svh flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight px-6">
      <MusicNotes />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-blue animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-neon-blue animate-pulse [animation-delay:0.2s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-neon-blue animate-pulse [animation-delay:0.4s]" />
        </div>
        <p className="text-text-secondary text-sm">Reconnecting to your duel...</p>
      </div>
    </div>
  )
}

export default Reconnecting
