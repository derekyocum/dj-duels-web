import { useState, useEffect } from 'react'
import AppBackground from '../components/AppBackground'
import AppNav from '../components/AppNav'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { fetchLeaderboard, fetchMyStats } from '../utils/api'

const MEDALS = ['🥇', '🥈', '🥉']

function RankBadge({ index }) {
  if (index == null) return <span className="text-text-muted/50 text-sm w-8 text-center">•</span>
  if (index < 3) return <span className="text-2xl w-8 text-center">{MEDALS[index]}</span>
  return <span className="text-text-muted font-bold text-sm w-8 text-center tabular-nums">{index + 1}</span>
}

function Row({ entry, index, isMe }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        isMe ? 'bg-neon-blue/10 border-neon-blue/40' : 'bg-card/40 border-text-muted/10'
      }`}
    >
      <RankBadge index={index} />
      <Avatar username={entry.username} avatarId={entry.avatarId} avatarColor={entry.avatarColor} size={36} />
      <span className={`flex-1 truncate text-sm font-semibold ${isMe ? 'text-neon-blue' : 'text-text-primary'}`}>
        {entry.username}{isMe && <span className="text-text-muted font-normal"> (you)</span>}
      </span>
      <span className="flex items-center gap-1.5 text-neon-yellow font-bold text-sm tabular-nums">
        🏆 {entry.trophies}
      </span>
    </div>
  )
}

function Leaderboard() {
  const { user } = useAuth()
  const [board, setBoard] = useState(null) // null = loading
  const [myStats, setMyStats] = useState(null)

  useEffect(() => {
    let ignore = false
    fetchLeaderboard(20)
      .then((data) => { if (!ignore) setBoard(data) })
      .catch(() => { if (!ignore) setBoard([]) })
    fetchMyStats()
      .then((s) => { if (!ignore) setMyStats(s) })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  const inTopList = board?.some((e) => e.username === user?.username)
  // Show a personal standing card only if the player has at least one trophy
  // but isn't already visible in the top list.
  const showMyStanding = myStats && myStats.trophies > 0 && !inTopList

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

      <AppNav />

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <span className="text-4xl mb-2">🏆</span>
            <h1 className="text-2xl font-bold text-text-primary">Leaderboard</h1>
            <p className="text-text-muted text-sm mt-1">Most trophies wins</p>
          </div>

          {board === null ? (
            <p className="text-text-muted text-center text-sm py-12">Loading…</p>
          ) : board.length === 0 ? (
            <div className="bg-card/60 border border-text-muted/15 rounded-2xl p-8 text-center">
              <span className="text-3xl block mb-2">🎧</span>
              <p className="text-text-primary font-semibold">No champions yet</p>
              <p className="text-text-muted text-sm mt-1">Win a duel to claim the top spot.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {board.map((entry, i) => (
                <Row key={entry.username} entry={entry} index={i} isMe={entry.username === user?.username} />
              ))}
            </div>
          )}

          {showMyStanding && (
            <div className="mt-6">
              <p className="text-text-muted text-[10px] uppercase tracking-widest font-medium text-center mb-2">
                Your standing
              </p>
              <Row entry={myStats} index={null} isMe />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Leaderboard
