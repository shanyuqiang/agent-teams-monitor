import { Users, Bot, MessageCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Member list component showing team members
 * @param {object} props
 * @param {object} props.team
 * @param {Array} props.members
 * @param {string|null} props.selectedMemberId
 * @param {(memberId: string) => void} props.onSelectMember
 * @param {Array} props.messages
 */
export function MemberList({ team, members, selectedMemberId, onSelectMember, messages }) {
  // Count messages per member
  const messageCountByMember = messages.reduce((acc, msg) => {
    acc[msg.from] = (acc[msg.from] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      {/* Team Header */}
      <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 className="font-semibold text-[hsl(var(--foreground))] truncate font-mono">
          {team.name}
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {members.length} members
        </p>
      </div>

      {/* All Members Option */}
      <button
        onClick={() => onSelectMember(null)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left',
          'transition-all duration-200',
          'hover:bg-[hsl(var(--primary))]/10',
          selectedMemberId === null && 'bg-[hsl(var(--primary))]/20 border-l-2 border-[hsl(var(--primary))]'
        )}
      >
        <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-medium shadow-neon-sm">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[hsl(var(--foreground))]">All Messages</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {messages.length} messages
          </p>
        </div>
      </button>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wider font-mono">
            <span className="text-[hsl(var(--primary))]">#</span> Members
          </h3>
        </div>

        {members.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bot className="w-10 h-10 mx-auto text-[hsl(var(--primary))] opacity-30 mb-2" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No members in this team
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {members.map((member) => {
              const memberId = member.name || member.id || member.agentId
              const msgCount = messageCountByMember[memberId] || 0
              const isSelected = selectedMemberId === memberId

              return (
                <button
                  key={memberId}
                  onClick={() => onSelectMember(memberId)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left',
                    'transition-all duration-200',
                    'hover:bg-[hsl(var(--primary))]/10',
                    isSelected && 'bg-[hsl(var(--primary))]/20 border-l-2 border-[hsl(var(--primary))]'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm',
                        member.color === 'blue' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                        member.color === 'green' && 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30',
                        member.color === 'yellow' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                        !member.color && 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                      )}
                    >
                      {member.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    {/* Status dot - neon green */}
                    <span className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[hsl(var(--card))]',
                      'bg-[hsl(var(--primary))] shadow-neon-sm'
                    )} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[hsl(var(--foreground))] truncate font-mono">
                      {member.name}
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] capitalize truncate">
                      {member.agentType || member.role || 'Agent'}
                    </p>
                  </div>

                  {/* Message count badge */}
                  {msgCount > 0 && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full shadow-neon-sm">
                      {msgCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
