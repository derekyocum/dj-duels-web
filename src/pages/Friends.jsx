import { useState, useEffect, useCallback } from 'react'
import AppBackground from '../components/AppBackground'
import AppNav from '../components/AppNav'
import FriendsCard from '../components/FriendsCard'
import Footer from '../components/Footer'
import { fetchFriends } from '../utils/api'

// Pure fetch, no setState -- safe to call from an effect's .then() or a plain
// event handler alike. Returns null on failure so the caller can keep whatever
// is already on screen rather than blanking the list over a transient error.
async function loadFriendsData() {
  try {
    return await fetchFriends()
  } catch {
    return null
  }
}

/**
 * Friend requests and list, as its own destination rather than a card buried
 * in Profile -- mirrors dj-duels-mobile/src/screens/FriendsScreen.jsx, which
 * put it in the hamburger next to Leaderboard for the same reason: it's a
 * place you go to *do* something, not a detail of your own account.
 *
 * Owns the fetching and hands FriendsCard a refetch callback; every mutation
 * refetches the whole graph rather than patching local state, since a single
 * action can move someone between two buckets (an accept empties an incoming
 * row AND adds a friend) and a refetch can't drift from the server.
 */
function Friends() {
  const [friends, setFriends] = useState({ friends: [], incoming: [], outgoing: [], blocked: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    loadFriendsData().then((data) => {
      if (ignore) return
      if (data) setFriends(data)
      setLoading(false)
    })
    return () => { ignore = true }
  }, [])

  const refresh = useCallback(async () => {
    const data = await loadFriendsData()
    if (data) setFriends(data)
  }, [])

  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

      <AppNav />

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <span className="text-4xl mb-2">👥</span>
            <h1 className="text-2xl font-bold text-text-primary">Friends</h1>
            <p className="text-text-muted text-sm mt-1">Add someone to start a Listening Lounge</p>
            {friends.incoming.length > 0 && (
              <span className="mt-3 px-2.5 py-1 text-[11px] font-bold rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
                {friends.incoming.length} request{friends.incoming.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <FriendsCard
            friends={friends.friends}
            incoming={friends.incoming}
            outgoing={friends.outgoing}
            blocked={friends.blocked}
            loading={loading}
            onChanged={refresh}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Friends
