import { useState, useEffect } from 'react'

/**
 * Hook for managing tasks data
 * @param {import('socket.io-client').Socket | null} socket
 * @param {string | null} teamId
 * @returns {{
 *   tasks: Array,
 *   tasksByStatus: object
 * }}
 */
export function useTasks(socket, teamId) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!socket) return

    // Request tasks for selected team
    if (teamId) {
      socket.emit('tasks:get', { teamId })
    }

    const handleTaskUpdate = (data) => {
      setTasks((prev) => {
        const index = prev.findIndex((t) => t.id === data.task.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...data.task }
          return updated
        }
        return [...prev, data.task]
      })
    }

    const handleTasksList = (data) => {
      // Handle both {tasks: [...]} and direct array formats
      const tasksList = Array.isArray(data) ? data : (data?.tasks || [])
      setTasks(tasksList)
    }

    const handleTaskRemove = (data) => {
      setTasks((prev) => prev.filter((t) => t.id !== data.taskId))
    }

    socket.on('task:update', handleTaskUpdate)
    socket.on('tasks:initial', handleTasksList)
    socket.on('tasks:list', handleTasksList)
    socket.on('task:remove', handleTaskRemove)

    return () => {
      socket.off('task:update', handleTaskUpdate)
      socket.off('tasks:initial', handleTasksList)
      socket.off('tasks:list', handleTasksList)
      socket.off('task:remove', handleTaskRemove)
    }
  }, [socket, teamId])

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status || 'pending'
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(task)
    return acc
  }, {})

  return {
    tasks,
    tasksByStatus,
  }
}