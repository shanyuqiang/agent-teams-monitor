import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for managing real-time messages
 * @param {import('socket.io-client').Socket | null} socket
 * @param {string | null} teamId
 * @returns {{
 *   messages: Array,
 *   clearMessages: () => void,
 *   markAsRead: (messageId: string) => void
 * }}
 */
export function useMessages(socket, teamId) {
  const [messages, setMessages] = useState([])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const markAsRead = useCallback((messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    )
  }, [])

  useEffect(() => {
    if (!socket) return

    // Request messages for selected team
    if (teamId) {
      socket.emit('messages:get', { teamId })
    }

    const handleMessage = (data) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === data.message.id)) {
          return prev
        }
        return [data.message, ...prev]
      })
    }

    const handleMessagesList = (data) => {
      // Handle both {messages: [...]} and direct array formats
      const messagesList = Array.isArray(data) ? data : (data?.messages || [])
      setMessages(messagesList)
    }

    socket.on('message:new', handleMessage)
    socket.on('messages:initial', handleMessagesList)
    socket.on('messages:list', handleMessagesList)

    return () => {
      socket.off('message:new', handleMessage)
      socket.off('messages:list', handleMessagesList)
    }
  }, [socket, teamId])

  return {
    messages,
    clearMessages,
    markAsRead,
  }
}