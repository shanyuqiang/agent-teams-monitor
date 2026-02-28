import { ChatLayout } from '@/components/ChatLayout'
import { useTheme } from '@/hooks/useTheme'
import { useSocket } from '@/hooks/useSocket'
import { useTeams } from '@/hooks/useTeams'
import { useMessages } from '@/hooks/useMessages'
import { useTasks } from '@/hooks/useTasks'

/**
 * Main dashboard page with chat interface
 */
export function Dashboard() {
  const theme = useTheme()
  const connection = useSocket('http://localhost:3001')
  const teams = useTeams(connection.socket)
  const messages = useMessages(connection.socket, teams.selectedTeam?.id)
  const tasks = useTasks(connection.socket, teams.selectedTeam?.id)

  return (
    <ChatLayout
      theme={theme}
      onToggleTheme={theme.toggleTheme}
      connection={connection}
      teams={teams}
      onSelectTeam={teams.selectTeam}
      messages={messages}
      tasks={tasks}
    />
  )
}
