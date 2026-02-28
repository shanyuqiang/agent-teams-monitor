import { useState } from 'react'
import { Menu, X, Sun, Moon, MessageSquare } from 'lucide-react'
import { StatusIndicator } from './StatusIndicator'
import { TeamList } from './TeamList'
import { MemberList } from './MemberList'
import { ChatPanel } from './ChatPanel'
import { MemberDetail } from './MemberDetail'
import { cn } from '@/utils/cn'

/**
 * Chat layout component with three-panel design
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {object} props.theme
 * @param {() => void} props.onToggleTheme
 * @param {object} props.connection
 * @param {object} props.teams
 * @param {(teamId: string) => void} props.onSelectTeam
 * @param {object} props.messages
 */
export function ChatLayout({
  theme,
  onToggleTheme,
  connection,
  teams,
  onSelectTeam,
  messages,
  tasks,
}) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [showMemberDetail, setShowMemberDetail] = useState(false)

  const selectedTeam = teams.selectedTeam
  const members = selectedTeam?.config?.members || []

  // Get selected member info
  const selectedMember = selectedMemberId
    ? members.find(m => m.name === selectedMemberId || m.agentId === selectedMemberId || m.id === selectedMemberId)
    : null

  // Get messages from team's inbox
  const teamMessages = selectedTeam?.inbox || []

  // Filter messages for selected member
  const filteredMessages = selectedMemberId
    ? teamMessages.filter(msg => {
        const isSentByMember = msg.from === selectedMemberId
        const isSentToMember = msg._sourceFile?.includes(`/inboxes/${selectedMemberId}.json`)
        return isSentByMember || isSentToMember
      })
    : teamMessages

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-40 h-16',
          'bg-[hsl(var(--card))]',
          'border-b border-[hsl(var(--border))]',
          'flex items-center justify-between px-4'
        )}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]',
              'text-[hsl(var(--muted-foreground))]',
              'hover:shadow-neon-sm'
            )}
          >
            {leftPanelOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'bg-[hsl(var(--primary))]',
                'shadow-neon-sm'
              )}
            >
              <MessageSquare className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
            </div>
            <h1 className="font-bold text-xl text-[hsl(var(--foreground))] hidden sm:block font-mono">
              <span className="text-[hsl(var(--primary))]">&gt;</span> Agent Teams
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator
            isConnected={connection.isConnected}
            error={connection.connectionError}
            onReconnect={connection.reconnect}
          />

          <button
            onClick={onToggleTheme}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]',
              'text-[hsl(var(--muted-foreground))]',
              'hover:shadow-neon-sm'
            )}
            title={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme.isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-16 h-screen flex">
        {/* Left Panel - Team List */}
        <aside
          className={cn(
            'h-full bg-[hsl(var(--card))]',
            'border-r border-[hsl(var(--border))]',
            'transition-all duration-300 overflow-hidden',
            leftPanelOpen ? 'w-64' : 'w-0'
          )}
        >
          <div className="p-4">
            <h2 className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-3 font-mono">
              <span className="text-[hsl(var(--primary))]">#</span> Discussion Groups
            </h2>
          </div>
          <TeamList
            teams={teams.teams}
            selectedTeamId={teams.selectedTeam?.id}
            onSelectTeam={(teamId) => {
              onSelectTeam(teamId)
              setSelectedMemberId(null)
            }}
            isLoading={teams.isLoading}
          />
        </aside>

        {/* Middle Panel - Member List */}
        <aside
          className={cn(
            'h-full bg-[hsl(var(--background))]',
            'border-r border-[hsl(var(--border))]',
            'w-64 flex-shrink-0',
            !selectedTeam && 'opacity-50'
          )}
        >
          {selectedTeam ? (
            <MemberList
              team={selectedTeam}
              members={members}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              messages={teamMessages}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="w-12 h-12 text-[hsl(var(--primary))] opacity-30 mb-3" />
              <p className="text-[hsl(var(--muted-foreground))] text-sm font-mono">
                Select a team to view members
              </p>
            </div>
          )}
        </aside>

        {/* Right Panel - Chat or Member Detail */}
        <main className="flex-1 h-full overflow-hidden">
          {showMemberDetail && selectedMember ? (
            <MemberDetail
              member={selectedMember}
              onClose={() => setShowMemberDetail(false)}
            />
          ) : (
            <ChatPanel
              team={selectedTeam}
              selectedMemberId={selectedMemberId}
              messages={filteredMessages}
              onClear={messages.clearMessages}
              tasks={tasks.tasks}
              onShowMemberDetail={() => setShowMemberDetail(true)}
              onShowSpecificMemberDetail={(memberId) => {
                setSelectedMemberId(memberId)
                setShowMemberDetail(true)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
