import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

/**
 * Extract recipient name from source file path
 * e.g., "/path/to/inboxes/team-lead.json" -> "team-lead"
 */
function extractRecipient(sourceFile) {
  if (!sourceFile) return null
  const match = sourceFile.match(/\/inboxes\/([^.]+)\.json$/)
  return match ? match[1] : null
}

/**
 * Message card component for displaying individual messages
 * @param {object} props
 * @param {object} props.message
 * @param {() => void} [props.onClick]
 * @param {() => void} [props.onMemberClick] - Callback when sender avatar is clicked
 * @param {string} [props.memberColor] - Color of the message sender
 */
export function MessageCard({ message, onClick, onMemberClick, memberColor }) {
  const priorityColors = {
    high: 'border-l-red-500 bg-red-500/10',
    medium: 'border-l-yellow-500 bg-yellow-500/10',
    low: 'border-l-blue-500 bg-blue-500/10',
    default: 'border-l-[hsl(var(--border))]',
  }

  const avatarColorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    green: 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }

  const priority = message.priority || 'default'
  const isRead = message.read

  // Extract sender and recipient for chat display
  const sender = message.from || 'Unknown'
  const recipient = extractRecipient(message._sourceFile)
  const isDirectMessage = recipient !== null

  const colorClass = avatarColorClasses[memberColor] || avatarColorClasses[message.color] || 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-lg border-l-4 transition-all duration-200',
        'bg-[hsl(var(--card))]',
        'border border-[hsl(var(--border))]',
        priorityColors[priority] || priorityColors.default,
        !isRead && 'ring-1 ring-[hsl(var(--primary))]/30',
        onClick && 'cursor-pointer hover:shadow-neon-sm hover:border-[hsl(var(--primary))]/50'
      )}
    >
      {/* Unread indicator */}
      {!isRead && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[hsl(var(--primary))] shadow-neon-sm" />
      )}

      {/* Header with Avatar */}
      <div className="flex items-start gap-3 mb-2">
        {/* Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMemberClick?.(sender)
          }}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-transform hover:scale-110',
            colorClass
          )}
          title={`View ${sender}'s profile`}
        >
          {sender.charAt(0).toUpperCase()}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[hsl(var(--foreground))] font-mono">
              {isDirectMessage ? (
                <>
                  <span className="text-blue-500">@{sender}</span>
                  <span className="text-[hsl(var(--muted-foreground))] mx-1">→</span>
                  <span className="text-blue-500">@{recipient}</span>
                </>
              ) : (
                message.from || 'Unknown'
              )}
            </span>
            {message.priority && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium capitalize font-mono',
                  priority === 'high' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                  priority === 'medium' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                  priority === 'low' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                )}
              >
                {priority}
              </span>
            )}
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))] opacity-60">
            {message.timestamp
              ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
              : 'Just now'}
          </span>
        </div>
      </div>

      {/* Subject */}
      {message.subject && (
        <h4 className="font-medium text-[hsl(var(--foreground))] mb-1">
          {message.subject}
        </h4>
      )}

      {/* Content */}
      <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
        {message.content || message.body || 'No content'}
      </p>

      {/* Metadata */}
      {(message.teamName || message.type) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[hsl(var(--border))]">
          {message.teamName && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Team: {message.teamName}
            </span>
          )}
          {message.type && (
            <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] font-mono">
              {message.type}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
