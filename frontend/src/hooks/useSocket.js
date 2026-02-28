import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

/**
 * Hook for managing Socket.io connection
 * @param {string} url - Socket.io server URL
 * @returns {{
 *   socket: import('socket.io-client').Socket | null,
 *   isConnected: boolean,
 *   connectionError: string | null,
 *   reconnect: () => void
 * }}
 */
export function useSocket(url = 'http://localhost:3001') {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const socketRef = useRef(null)

  const connect = useCallback(() => {
    setConnectionError(null)

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
      setConnectionError(error.message)
    })

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed')
      setConnectionError('Reconnection failed. Please try again.')
    })

    socketRef.current = socket
  }, [url])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.close()
      socketRef.current = null
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [disconnect, connect])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    reconnect,
  }
}