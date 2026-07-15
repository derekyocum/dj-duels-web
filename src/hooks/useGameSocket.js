import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'

const getStoredToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('dj_duels_user') || '{}')
    return user.accessToken ?? null
  } catch {
    return null
  }
}

export function useGameSocket(duelId, onEvent) {
  const clientRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const onEventRef = useRef(onEvent)

  // Keep the callback ref current without re-subscribing on every render
  useEffect(() => {
    onEventRef.current = onEvent
  })

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
        client.subscribe(`/topic/lobby/${duelId}`, (msg) => {
          onEventRef.current(JSON.parse(msg.body))
        })
        client.subscribe(`/topic/round/${duelId}`, (msg) => {
          onEventRef.current(JSON.parse(msg.body))
        })
        setIsConnected(true)
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error('STOMP error', frame)
        setIsConnected(false)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      setIsConnected(false)
    }
  }, [duelId])

  const send = useCallback((destination, body) => {
    clientRef.current?.publish({
      destination: `/app/${destination}`,
      body: JSON.stringify(body),
    })
  }, [])

  return { send, isConnected }
}
