import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { refreshAccessToken, REFRESH_EXPIRED } from '../services/authService'

// Safety net only, not the primary "is this session dead" signal any more --
// see the onStompError comment below. A persistent loop that isn't really
// about the token (e.g. the server closing for an unrelated reason whose
// message happens to mention "authorization") shouldn't retry forever.
const MAX_TOKEN_RETRY_ATTEMPTS = 5

// VITE_WS_URL may be just the API origin (e.g. wss://api.dj-duels.com) or the
// full broker URL. Normalize so it always targets the STOMP endpoint at /ws.
function resolveWsUrl() {
  const raw = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'
  const trimmed = raw.replace(/\/+$/, '')
  return trimmed.endsWith('/ws') ? trimmed : `${trimmed}/ws`
}

const WS_URL = resolveWsUrl()

const getStoredToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('dj_duels_user') || '{}')
    return user.accessToken ?? null
  } catch {
    return null
  }
}

const DuelSocketContext = createContext(null)

/**
 * Owns ONE STOMP connection for the lifetime of a duel, shared across every
 * in-duel page (Lobby → Faceoff → Stage → Champion). Because the
 * connection lives above the routed pages, navigating between them no longer
 * tears down and rebuilds the socket — so broadcasts are never dropped in a
 * reconnect window. Outbound sends are queued until the socket is connected.
 */
export function DuelSocketProvider({ duelId, children }) {
  const clientRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const listenersRef = useRef(new Set())
  const outboxRef = useRef([])
  // Counts refresh-triggered reconnect attempts that didn't end in a genuine
  // REFRESH_EXPIRED verdict -- a pure safety net against a persistent loop
  // that isn't actually about the token (see MAX_TOKEN_RETRY_ATTEMPTS).
  // Reset on a real connect.
  const refreshAttemptsRef = useRef(0)

  const dispatchEvent = useCallback((event) => {
    listenersRef.current.forEach((fn) => {
      try {
        fn(event)
      } catch (err) {
        console.error('duel event listener error', err)
      }
    })
  }, [])

  useEffect(() => {
    if (!duelId) return

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      // Fetch the latest token before each connect/reconnect attempt
      beforeConnect: () => {
        const token = getStoredToken()
        client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {}
      },
      onConnect: () => {
        refreshAttemptsRef.current = 0 // a real connect means the token is genuinely fine again
        client.subscribe(`/topic/lobby/${duelId}`, (msg) => dispatchEvent(JSON.parse(msg.body)))
        client.subscribe(`/topic/round/${duelId}`, (msg) => dispatchEvent(JSON.parse(msg.body)))
        // Per-user reply channel for state snapshots (resync).
        client.subscribe('/user/queue/duel', (msg) => dispatchEvent(JSON.parse(msg.body)))
        setIsConnected(true)
        // Ask the server where we are on every (re)connect so a reconnect or a
        // full refresh self-heals to the correct page instead of getting stuck.
        client.publish({ destination: '/app/duel/sync', body: JSON.stringify({ duelId }) })
        // Flush anything queued while disconnected (e.g. a lock-in fired before
        // the socket finished connecting after a page transition).
        const queued = outboxRef.current
        outboxRef.current = []
        queued.forEach(({ destination, body }) =>
          client.publish({ destination, body: JSON.stringify(body) })
        )
      },
      onDisconnect: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false),
      onStompError: (frame) => {
        setIsConnected(false)
        // The server rejects a bad/expired token by CLOSING the socket with an
        // ERROR frame. Most of the time this is just the access token expiring
        // mid-session, not a truly dead login -- try one silent refresh before
        // giving up.
        const reason = frame?.headers?.message || ''
        if (!/token|authoriz/i.test(reason)) {
          console.error('STOMP error', frame)
          return
        }
        refreshAccessToken().then((result) => {
          if (result === REFRESH_EXPIRED) {
            // The server explicitly rejected the refresh token -- no amount of
            // retrying fixes this, only a fresh login does.
            client.deactivate()
            dispatchEvent({ type: 'AUTH_EXPIRED' })
            return
          }
          // Anything else (refreshed fine, or the refresh call itself couldn't
          // reach the server) means the credential is NOT confirmed dead. This
          // used to force a logout on any failure here, which is what actually
          // kicked people out mid-duel: a brief network hiccup during a
          // refresh attempt got treated the same as a truly expired login,
          // well before the access token's real ~60min lifetime was up. Don't
          // deactivate -- the client's own reconnectDelay retries
          // automatically, and beforeConnect() re-reads localStorage each
          // time, so a credential that recovers (or was fine all along) gets
          // picked up on the very next attempt. Only give up if this keeps
          // happening well past what a transient blip should take.
          refreshAttemptsRef.current += 1
          if (refreshAttemptsRef.current > MAX_TOKEN_RETRY_ATTEMPTS) {
            client.deactivate()
            dispatchEvent({ type: 'AUTH_EXPIRED' })
          }
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
      setIsConnected(false)
    }
  }, [duelId, dispatchEvent])

  // Stable across renders — safe to depend on without re-subscribing.
  const send = useCallback((destination, body) => {
    const dest = `/app/${destination}`
    const client = clientRef.current
    if (client?.connected) {
      client.publish({ destination: dest, body: JSON.stringify(body) })
    } else {
      outboxRef.current.push({ destination: dest, body })
    }
  }, [])

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn)
    return () => listenersRef.current.delete(fn)
  }, [])

  return (
    <DuelSocketContext.Provider value={{ send, subscribe, isConnected }}>
      {children}
    </DuelSocketContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDuelSocket() {
  const ctx = useContext(DuelSocketContext)
  if (!ctx) throw new Error('useDuelSocket must be used within DuelSocketProvider')
  return { send: ctx.send, isConnected: ctx.isConnected }
}

/**
 * Register a handler for duel events. The handler ref is kept current without
 * re-subscribing on every render, and `subscribe` is stable, so this attaches
 * exactly one listener for the component's lifetime.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useDuelEvents(handler) {
  const ctx = useContext(DuelSocketContext)
  if (!ctx) throw new Error('useDuelEvents must be used within DuelSocketProvider')
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })
  const { subscribe } = ctx
  useEffect(() => subscribe((event) => handlerRef.current?.(event)), [subscribe])
}
