import { useState } from 'react'
import { sendFriendRequest, acceptFriendRequest, removeFriend } from '../utils/api'

function Avatar({ username }) {
  return (
    <div className="w-9 h-9 shrink-0 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 flex items-center justify-center">
      <span className="text-neon-cyan font-bold text-sm">{username.charAt(0).toUpperCase()}</span>
    </div>
  )
}

function Row({ username, children }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <Avatar username={username} />
      <span className="flex-1 min-w-0 truncate text-text-primary text-sm font-medium">{username}</span>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  )
}

/**
 * Friends list + request flow. Every mutation refetches the whole graph via
 * onChanged rather than patching local state: the three buckets are derived
 * server-side and a single action can move someone between two of them (an
 * accept empties an incoming row AND adds a friend), so a refetch is both
 * simpler and can't drift from what the server actually thinks.
 */
function FriendsCard({ friends = [], incoming = [], outgoing = [], loading, onChanged }) {
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // Shared wrapper so every action gets the same busy-lock, error surfacing and
  // refetch without repeating the try/catch four times.
  const run = async (fn, successMessage) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await fn()
      if (successMessage) setNotice(successMessage)
      await onChanged?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    const name = username.trim()
    if (!name) return
    run(async () => {
      await sendFriendRequest(name)
      setUsername('')
    }, `Request sent to ${name}`)
  }

  return (
    <div className="bg-card/60 border border-text-muted/15 rounded-2xl overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-text-muted/10 flex items-center justify-between">
        <h2 className="text-text-primary font-semibold text-sm">Friends</h2>
        {incoming.length > 0 && (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
            {incoming.length} request{incoming.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <form onSubmit={handleAdd} className="px-6 py-4 border-b border-text-muted/10 flex gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add a friend by username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="flex-1 min-w-0 bg-card border border-text-muted/20 text-text-primary rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50 transition-colors"
        />
        <button
          type="submit"
          disabled={busy || !username.trim()}
          className="shrink-0 px-4 py-2 text-sm font-semibold rounded-lg bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      {(error || notice) && (
        <div className="px-6 py-3 border-b border-text-muted/10">
          <p className={`text-sm ${error ? 'text-neon-pink' : 'text-neon-green'}`}>{error || notice}</p>
        </div>
      )}

      {incoming.length > 0 && (
        <div className="border-b border-text-muted/10">
          <p className="px-6 pt-4 pb-1 text-text-muted text-[10px] uppercase tracking-widest font-semibold">
            Wants to be friends
          </p>
          {incoming.map((f) => (
            <Row key={f.username} username={f.username}>
              <button
                onClick={() => run(() => acceptFriendRequest(f.username), `You and ${f.username} are now friends`)}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-neon-green/15 text-neon-green border border-neon-green/30 hover:bg-neon-green/25 transition-colors cursor-pointer disabled:opacity-40"
              >
                Accept
              </button>
              <button
                onClick={() => run(() => removeFriend(f.username))}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-text-muted/15 text-text-muted hover:bg-text-muted/25 transition-colors cursor-pointer disabled:opacity-40"
              >
                Decline
              </button>
            </Row>
          ))}
        </div>
      )}

      <div>
        {loading ? (
          <p className="px-6 py-6 text-text-muted text-sm text-center">Loading…</p>
        ) : friends.length === 0 ? (
          <p className="px-6 py-6 text-text-muted text-sm text-center">
            No friends yet — add someone by username to start a Listening Lounge together.
          </p>
        ) : (
          friends.map((f) => (
            <Row key={f.username} username={f.username}>
              <button
                onClick={() => run(() => removeFriend(f.username))}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-text-muted/15 text-text-muted hover:bg-neon-pink/20 hover:text-neon-pink transition-colors cursor-pointer disabled:opacity-40"
              >
                Remove
              </button>
            </Row>
          ))
        )}
      </div>

      {outgoing.length > 0 && (
        <div className="border-t border-text-muted/10">
          <p className="px-6 pt-4 pb-1 text-text-muted text-[10px] uppercase tracking-widest font-semibold">
            Waiting on them
          </p>
          {outgoing.map((f) => (
            <Row key={f.username} username={f.username}>
              <span className="text-text-muted text-xs">Pending</span>
              <button
                onClick={() => run(() => removeFriend(f.username))}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-text-muted/15 text-text-muted hover:bg-text-muted/25 transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
            </Row>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendsCard
