import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import FriendsCard from './FriendsCard'
import { fetchFriends, fetchInvites, dismissInvite } from '../utils/api'

// Pure fetches, no setState -- safe to call from an effect or a plain event
// handler alike. Return null on failure so the caller keeps whatever's
// already on screen rather than blanking it over a transient error.
async function loadFriendsData() {
  try {
    return await fetchFriends()
  } catch {
    return null
  }
}

async function loadInvites() {
  try {
    return await fetchInvites()
  } catch {
    return null
  }
}

/**
 * Friends, as a modal rather than a full-page redirect -- opening it from
 * inside a live Duel lobby or Lounge used to unmount that room's socket
 * (RoomSocketProvider only connects while you're actually on /lobby/:id or
 * /lounge/:id), which this avoids entirely by never navigating away.
 *
 * Shell mirrors PrivateDuelModal/LoungeModal (backdrop-click + Escape to
 * close, no explicit X). Owns the same fetch/refresh logic the old Friends
 * page had, plus incoming lobby invites: polled on open and every 30s while
 * open, since the app has no live per-user channel to push them.
 */
function FriendsModal({ isOpen, onClose, currentRoom }) {
  const [friends, setFriends] = useState({ friends: [], incoming: [], outgoing: [], blocked: [] })
  const [loading, setLoading] = useState(true)
  const [invites, setInvites] = useState({ incoming: [], outgoing: [] })
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    const data = await loadFriendsData()
    if (data) setFriends(data)
  }, [])

  const refreshInvites = useCallback(async () => {
    const data = await loadInvites()
    if (data) setInvites(data)
  }, [])

  // Data from a prior open stays on screen while this fetches -- no loading
  // flash on reopen, only on the very first fetch (loading starts true).
  useEffect(() => {
    if (!isOpen) return
    let ignore = false
    Promise.all([loadFriendsData(), loadInvites()]).then(([friendsData, invitesData]) => {
      if (ignore) return
      if (friendsData) setFriends(friendsData)
      if (invitesData) setInvites(invitesData)
      setLoading(false)
    })
    const interval = setInterval(refreshInvites, 30000)
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [isOpen, refreshInvites])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleJoin = (invite) => {
    const path = invite.roomType === 'LOUNGE' ? `/lounge/${invite.roomId}` : `/lobby/${invite.roomId}`
    onClose()
    navigate(path)
    dismissInvite(invite.id).catch(() => {})
  }

  const handleDismiss = async (invite) => {
    try {
      await dismissInvite(invite.id)
    } finally {
      refreshInvites()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onClick={onClose}>
      <div
        className="bg-dark-surface border border-text-muted/15 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center mb-6">
          <span className="text-3xl mb-2">👥</span>
          <h2 className="text-xl font-bold text-text-primary">Friends</h2>
          <p className="text-text-muted text-sm mt-1">Add someone to start a Listening Lounge</p>
          {friends.incoming.length > 0 && (
            <span className="mt-3 px-2.5 py-1 text-[11px] font-bold rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
              {friends.incoming.length} request{friends.incoming.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {invites.incoming.length > 0 && (
          <div className="mb-4 space-y-2">
            {invites.incoming.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-neon-purple/10 border border-neon-purple/25"
              >
                <p className="text-text-primary text-sm min-w-0">
                  <span className="font-semibold">{inv.fromUsername}</span> invited you to a{' '}
                  {inv.roomType === 'LOUNGE' ? 'Lounge' : 'Duel'}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleJoin(inv)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40 hover:bg-neon-purple/30 transition-colors cursor-pointer"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => handleDismiss(inv)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-text-muted/15 text-text-muted hover:bg-text-muted/25 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <FriendsCard
          friends={friends.friends}
          incoming={friends.incoming}
          outgoing={friends.outgoing}
          blocked={friends.blocked}
          loading={loading}
          onChanged={refresh}
          currentRoom={currentRoom}
          outgoingInvites={invites.outgoing}
          onInviteSent={refreshInvites}
        />
      </div>
    </div>
  )
}

export default FriendsModal
