import {useAuth} from '../modules/auth/core/Auth'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 3000 // 3 seconds
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map()
  private isConnecting = false
  private isLoggingOut = false // Flag to prevent reconnection after logout

  constructor() {
    // Don't auto-connect in constructor
  }

  public connect(isAuthenticated: boolean) {
    if (!isAuthenticated) {
      console.log('Cannot connect WebSocket - user is not authenticated')
      return
    }

    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected or connecting')
      return
    }

    // Reset logout flag when starting a new connection
    this.isLoggingOut = false
    this.isConnecting = true
    const wsUrl = `${import.meta.env.VITE_WS_URL}ws`
    console.log('Connecting to WebSocket:', wsUrl)
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully')
      this.reconnectAttempts = 0
      this.isConnecting = false
      
      // Send initial ping
      this.sendPing()
    }

    this.ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data)
      try {
        const data = JSON.parse(event.data)
        console.log('Parsed WebSocket message:', data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      })
      this.isConnecting = false
      if (!this.isLoggingOut) {
        this.handleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.isConnecting = false
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isLoggingOut) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect(true), this.reconnectTimeout)
    } else {
      console.error('Max reconnection attempts reached or user is logging out')
    }
  }

  private handleMessage(data: any) {
    console.log('Handling message type:', data.type)
    const handlers = this.messageHandlers.get(data.type) || []
    console.log('Found handlers:', handlers.length)
    handlers.forEach(handler => handler(data.data))
  }

  public subscribe(type: string, handler: (data: any) => void) {
    console.log('Subscribing to message type:', type)
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)?.push(handler)
  }

  public unsubscribe(type: string, handler: (data: any) => void) {
    console.log('Unsubscribing from message type:', type)
    const handlers = this.messageHandlers.get(type) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  public sendPing() {
    console.log('Sending ping message')
    this.sendMessage({type: 'ping'})
  }

  public sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message)
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('Cannot send message - WebSocket is not connected')
    }
  }

  public sendBroadcast(message: any) {
    console.log('Sending broadcast message:', message)
    this.sendMessage({
      type: 'broadcast',
      data: message
    })
  }

  public disconnect() {
    console.log('Disconnecting WebSocket')
    this.isLoggingOut = true // Set flag to prevent reconnection
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService()

export default webSocketService 