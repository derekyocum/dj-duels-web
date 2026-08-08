import { useState, useEffect, useMemo } from 'react'
import { fetchAvatars } from './api'

/**
 * Batches avatar (icon/color) lookups for a set of usernames -- used by
 * anywhere that shows a roster of people (duel lobby/faceoff/champion, lounge
 * room, friends list) so everyone's real profile picture resolves in one
 * request instead of one per person.
 *
 * Returns a plain {username: {avatarId, avatarColor}} map; a username with no
 * entry (still loading, or no stats row) simply falls back to Avatar's own
 * deterministic-color/initials behavior, so there's no loading state to wire
 * up at call sites.
 */
export function useAvatars(usernames) {
  // Joined to a stable string so the effect only re-fires when the actual SET
  // of usernames changes, not on every render of a fresh array literal.
  const key = useMemo(
    () => [...new Set((usernames ?? []).filter(Boolean))].sort().join(','),
    [usernames]
  )
  const [avatars, setAvatars] = useState({})

  useEffect(() => {
    if (!key) return
    let ignore = false
    fetchAvatars(key.split(',')).then((rows) => {
      if (ignore) return
      setAvatars(Object.fromEntries(
        rows.map((r) => [r.username, { avatarId: r.avatarId, avatarColor: r.avatarColor }])
      ))
    })
    return () => { ignore = true }
  }, [key])

  return avatars
}
