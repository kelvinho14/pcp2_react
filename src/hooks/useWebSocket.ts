import { useEffect, useRef, useCallback, useMemo } from 'react'
import webSocketService from '../app/services/WebSocketService'
import { useAuth } from '../app/modules/auth/core/Auth'

interface WebSocketSubscription {
  type: 'channel' | 'message'
  name: string
  handler: (data: any) => void
}

interface UseWebSocketProps {
  subscriptions?: WebSocketSubscription[]
  onConnect?: () => void
  onDisconnect?: () => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

export const useWebSocket = ({
  subscriptions = [],
  onConnect,
  onDisconnect
}: UseWebSocketProps = {}): UseWebSocketReturn => {
  const { currentUser } = useAuth()
  const isConnectedRef = useRef(false)
  
  // Memoize subscriptions to prevent recreation on every render
  const memoizedSubscriptions = useMemo(() => subscriptions, [
    ...subscriptions.map(sub => `${sub.type}:${sub.name}`)
  ])

  // Handle WebSocket connection
  const connect = useCallback(() => {
    if (currentUser) {
      webSocketService.connect(true)
      isConnectedRef.current = true
      onConnect?.()
    }
  }, [currentUser, onConnect])

  const disconnect = useCallback(() => {
    webSocketService.disconnect()
    isConnectedRef.current = false
    onDisconnect?.()
  }, [onDisconnect])

  // Handle connection state
  useEffect(() => {
    if (currentUser) {
      connect()
    } else {
      disconnect()
    }
  }, [currentUser, connect, disconnect])

  // Subscribe to channels and message types
  useEffect(() => {
    if (currentUser && memoizedSubscriptions.length > 0) {
      memoizedSubscriptions.forEach(subscription => {
        if (subscription.type === 'channel') {
          webSocketService.subscribeToChannel(subscription.name, subscription.handler)
        } else if (subscription.type === 'message') {
          webSocketService.subscribe(subscription.name, subscription.handler)
        }
      })
    }

    return () => {
      // Cleanup subscriptions
      memoizedSubscriptions.forEach(subscription => {
        if (subscription.type === 'channel') {
          webSocketService.unsubscribeFromChannel(subscription.name, subscription.handler)
        } else if (subscription.type === 'message') {
          webSocketService.unsubscribe(subscription.name, subscription.handler)
        }
      })
    }
  }, [currentUser, memoizedSubscriptions])

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect
  }
} 