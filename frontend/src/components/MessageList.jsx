import { useState } from 'react'
import { Mail, Inbox, Trash2, CheckCheck, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { MessageCard } from './MessageCard'
import { cn } from '@/utils/cn'

/**
 * Message list component for real-time inbox
 * @param {object} props
 * @param {Array} props.messages
 * @param {() => void} props.onClear
 * @param {(messageId: string) => void} props.onMarkAsRead
 * @param {string|null} props.teamId
 * @param {(memberId: string) => props.onMemberClick - Callback when member avatar is clicked
 * @param {Array} props.members - Team members for getting member colors
 */
export function MessageList({ messages, onClear, onMarkAsRead, teamId, onMemberClick, members }) {
  const [filter, setFilter] = useState('all') // all, unread, high

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread') return !msg.read
    if (filter === 'high') return msg.priority === 'high'
    return true
  })

  const unreadCount = messages.filter((m) => !m.read).length
  const highPriorityCount = messages.filter((m) => m.priority === 'high').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h3 className="font-semibold text-[hsl(var(--foreground))] font-mono">
              <span className="text-[hsl(var(--primary))]">#</span> Inbox
            </h3>
          </div>
          <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
            ({messages.length} messages)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClear}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-mono',
                'text-red-400 hover:bg-red-500/20',
                'rounded-md transition-all'
              )}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={messages.length}
        >
          All
        </FilterButton>
        <FilterButton
          active={filter === 'unread'}
          onClick={() => setFilter('unread')}
          count={unreadCount}
        >
          Unread
        </FilterButton>
        <FilterButton
          active={filter === 'high'}
          onClick={() => setFilter('high')}
          count={highPriorityCount}
        >
          High Priority
        </FilterButton>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="w-12 h-12 text-[hsl(var(--primary))] opacity-30 mb-3" />
            <p className="text-[hsl(var(--muted-foreground))] font-mono">
              {messages.length === 0
                ? 'No messages yet'
                : 'No messages match the selected filter'}
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const senderName = message.from
            const senderMember = members?.find(m => m.name === senderName)
            const memberColor = senderMember?.color || message.color

            return (
              <div
                key={message.id || index}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MessageCard
                  message={message}
                  onClick={() => message.id && onMarkAsRead(message.id)}
                  onMemberClick={onMemberClick}
                  memberColor={memberColor}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/**
 * Filter button component
 * @param {object} props
 * @param {boolean} props.active
 * @param {() => void} props.onClick
 * @param {number} props.count
 * @param {React.ReactNode} props.children
 */
function FilterButton({ active, onClick, count, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-all font-mono',
        active
          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-neon-sm'
          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))]/10'
      )}
    >
      {children}
      {count > 0 && (
        <span
          className={cn(
            'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
            active
              ? 'bg-[hsl(var(--primary-foreground))]/20'
              : 'bg-[hsl(var(--muted))]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
