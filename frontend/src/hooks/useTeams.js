import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for managing teams data
 * @param {import('socket.io-client').Socket | null} socket
 * @returns {{
 *   teams: Array,
 *   selectedTeam: object | null,
 *   selectTeam: (teamId: string) => void,
 *   isLoading: boolean
 * }}
 */
export function useTeams(socket) {
  const [teams, setTeams] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const selectTeam = useCallback((teamId) => {
    setSelectedTeamId(teamId)
  }, [])

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null

  // Fetch initial data from API
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:3001/api/teams')
        const result = await response.json()
        if (result.success) {
          setTeams(result.data)
          // Auto-select first team if none selected
          if (!selectedTeamId && result.data.length > 0) {
            setSelectedTeamId(result.data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeams()
  }, [])

  useEffect(() => {
    if (!socket) return

    // Listen for teams updates
    const handleTeamsUpdate = (data) => {
      // Handle both {teams: [...]} and direct array formats
      const teamsList = Array.isArray(data) ? data : (data?.teams || [])
      setTeams(teamsList)

      // Auto-select first team if none selected
      if (!selectedTeamId && teamsList.length > 0) {
        setSelectedTeamId(teamsList[0].id)
      }
    }

    const handleTeamUpdate = (data) => {
      setTeams((prev) => {
        const index = prev.findIndex((t) => t.id === data.team.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...data.team }
          return updated
        }
        return [...prev, data.team]
      })
    }

    const handleTeamRemove = (data) => {
      setTeams((prev) => prev.filter((t) => t.id !== data.teamId))
    }

    socket.on('teams:initial', handleTeamsUpdate)
    socket.on('teams:list', handleTeamsUpdate)
    socket.on('teams:update', handleTeamsUpdate)
    socket.on('team:update', handleTeamUpdate)
    socket.on('team:remove', handleTeamRemove)

    return () => {
      socket.off('teams:initial', handleTeamsUpdate)
      socket.off('teams:list', handleTeamsUpdate)
      socket.off('teams:update', handleTeamsUpdate)
      socket.off('team:update', handleTeamUpdate)
      socket.off('team:remove', handleTeamRemove)
    }
  }, [socket, selectedTeamId])

  return {
    teams,
    selectedTeam,
    selectTeam,
    isLoading,
  }
}