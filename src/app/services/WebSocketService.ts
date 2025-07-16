import {useAuth} from '../modules/auth/core/Auth'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 3000 // 3 seconds
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map()
  private channelHandlers: Map<string, ((data: any) => void)[]> = new Map()
  private subscribedChannels: Set<string> = new Set()
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
      
      // Resubscribe to all channels after reconnection
      this.resubscribeToChannels()
      
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
    console.log('Handling message:', data)
    
    // Handle Redis channel messages
    if (data.channel && data.message) {
      console.log('Handling Redis channel message:', data.channel)
      const handlers = this.channelHandlers.get(data.channel) || []
      console.log('Found channel handlers:', handlers.length)
      handlers.forEach(handler => {
        try {
          const messageData = JSON.parse(data.message)
          handler(messageData)
        } catch (error) {
          console.error('Error parsing Redis message:', error)
          // Fallback to raw message if JSON parsing fails
          handler(data.message)
        }
      })
      return
    }
    
    // Handle regular message types (for backward compatibility)
    if (data.type) {
      console.log('Handling message type:', data.type)
      const handlers = this.messageHandlers.get(data.type) || []
      console.log('Found handlers:', handlers.length)
      handlers.forEach(handler => handler(data.data))
    }
  }

  private resubscribeToChannels() {
    console.log('Resubscribing to channels:', Array.from(this.subscribedChannels))
    this.subscribedChannels.forEach(channel => {
      this.sendMessage({
        type: 'subscribe',
        channel: channel
      })
    })
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

  public subscribeToChannel(channel: string, handler: (data: any) => void) {
    console.log('Subscribing to Redis channel:', channel)
    if (!this.channelHandlers.has(channel)) {
      this.channelHandlers.set(channel, [])
    }
    this.channelHandlers.get(channel)?.push(handler)
    
    // Track subscribed channels for reconnection
    this.subscribedChannels.add(channel)
    
    // Send subscription message to server
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'subscribe',
        channel: channel
      })
    }
  }

  public unsubscribeFromChannel(channel: string, handler: (data: any) => void) {
    console.log('Unsubscribing from Redis channel:', channel)
    const handlers = this.channelHandlers.get(channel) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
    
    // If no more handlers for this channel, remove from tracking
    if (handlers.length === 0) {
      this.subscribedChannels.delete(channel)
      
      // Send unsubscription message to server
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'unsubscribe',
          channel: channel
        })
      }
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
    this.subscribedChannels.clear()
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService()

export default webSocketService 