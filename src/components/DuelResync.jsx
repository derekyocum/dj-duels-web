import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useDuelEvents } from '../context/DuelSocketContext'

// Map a server STATE_SNAPSHOT to the page + props that render the current phase.
// The snapshot feeds the same shape each page already reads from location.state,
// so recovery works without rewriting the pages. Round number is 1 for now
// (single-round 2-player); Phase 3 adds multi-round tracking.
function routeForSnapshot(snap, duelId) {
  const roundNum = 1
  switch (snap.phase) {
    case 'LOBBY':
      return { path: `/lobby/${duelId}`, state: null }
    case 'FACEOFF':
      return {
        path: `/duel/${duelId}/round/${roundNum}`,
        state: {
          player1: snap.player1,
          player2: snap.player2,
          settings: snap.settings,
          allPlayers: snap.allPlayers,
          roundLabel: snap.roundLabel,
          faceoffEndsAt: snap.faceoffEndsAt,
        },
      }
    case 'STAGE':
      return {
        path: `/duel/${duelId}/round/${roundNum}/stage`,
        state: {
          player1: snap.player1,
          player2: snap.player2,
          track1: snap.track1,
          track2: snap.track2,
          allPlayers: snap.allPlayers,
          trackHistory: snap.trackHistory,
          roundLabel: snap.roundLabel,
          songEndsAt: snap.songEndsAt,
          currentSongIndex: snap.currentSongIndex,
        },
      }
    default:
      // ROUND_RESULT / CHAMPION / CLOSING — leave the client where it is; these
      // are handled by live events today and by the server machine in Phase 3.
      return null
  }
}

/**
 * Listens for the server's STATE_SNAPSHOT (sent on every connect) and, if the
 * client is on the wrong page for the current phase, routes it there with the
 * state to render. This is what makes a reconnect or a browser refresh recover
 * instead of hanging or bouncing to `/`.
 */
function DuelResync({ duelId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const locRef = useRef(location)
  useEffect(() => {
    locRef.current = location
  })

  useDuelEvents((event) => {
    if (event.type !== 'STATE_SNAPSHOT') return
    const target = routeForSnapshot(event.payload, duelId)
    if (!target) return
    const onWrongPage = locRef.current.pathname !== target.path
    // Deliver state when we're on the wrong page (missed a transition) OR on the
    // right page but without state (opened via direct URL / lost history state).
    // When state is already present (normal play), do nothing so we don't disrupt.
    const missingState = target.state && !locRef.current.state
    if (onWrongPage || missingState) {
      navigate(target.path, { state: target.state, replace: true })
    }
  })

  return null
}

export default DuelResync
