import { Users, Settings, Bot, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

/**
 * Team member card component
 * @param {object} props
 * @param {object} props.member
 */
function MemberCard({ member }) {
  const statusColors = {
    online: 'bg-[hsl(var(--primary))] shadow-neon-sm',
    busy: 'bg-yellow-500',
    offline: 'bg-[hsl(var(--muted-foreground))]',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-[hsl(var(--muted))]',
        'border border-[hsl(var(--border))]',
        'hover:border-[hsl(var(--primary))]/50 transition-all'
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'bg-[hsl(var(--primary))]/20',
            'text-[hsl(var(--primary))] font-medium',
            'border border-[hsl(var(--primary))]/30'
          )}
        >
          {member.name?.charAt(0).toUpperCase() ||
            member.role?.charAt(0).toUpperCase() ||
            'A'}
        </div>
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[hsl(var(--card))]',
            statusColors[member.status] || statusColors.offline
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-[hsl(var(--foreground))] truncate font-mono">
          {member.name || member.role}
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] capitalize">
          {member.role}
        </p>
      </div>
    </div>
  )
}

/**
 * Config item component
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value
 */
function ConfigItem({ label, value }) {
  // Handle different value types
  let displayValue = value
  if (typeof value === 'object' && value !== null) {
    displayValue = JSON.stringify(value).slice(0, 100)
    if (JSON.stringify(value).length > 100) displayValue += '...'
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
      <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate max-w-[60%] font-mono" title={displayValue}>
        {String(displayValue)}
      </span>
    </div>
  )
}

/**
 * Team detail view component
 * @param {object} props
 * @param {object|null} props.team
 */
export function TeamDetail({ team }) {
  if (!team) {
    return (
      <div className="flex items-center justify-center h-64 text-[hsl(var(--muted-foreground))]">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--primary))] opacity-30" />
          <p className="font-mono">Select a team to view details</p>
        </div>
      </div>
    )
  }

  const members = team.config?.members || team.members || []
  const config = team.config || {}
  const description = team.config?.description || team.description || 'No description'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] font-mono">
            <span className="text-[hsl(var(--primary))]">></span> {team.name}
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Mail className="w-4 h-4" />
          <span className="font-mono">Inbox: {team.inboxCount || 0}</span>
        </div>
      </div>

      {/* Members Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
          <h3 className="font-semibold text-[hsl(var(--foreground))] font-mono">
            <span className="text-[hsl(var(--primary))]">#</span> Members ({members.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((member, index) => (
            <MemberCard key={member.id || index} member={member} />
          ))}
        </div>
        {members.length === 0 && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] italic font-mono">
            No members in this team
          </p>
        )}
      </div>

      {/* Configuration Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-[hsl(var(--primary))]" />
          <h3 className="font-semibold text-[hsl(var(--foreground))] font-mono">
            <span className="text-[hsl(var(--primary))]">#</span> Configuration
          </h3>
        </div>
        <div className="bg-[hsl(var(--muted))] rounded-lg p-4 border border-[hsl(var(--border))]">
          {Object.keys(config).length > 0 ? (
            Object.entries(config)
              .filter(([key]) => key !== 'members') // Exclude members, shown separately
              .map(([key, value]) => (
                <ConfigItem
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={value}
                />
              ))
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))] italic font-mono">
              No configuration settings
            </p>
          )}
        </div>
      </div>

      {/* Metadata */}
      {team.createdAt && (
        <div className="text-xs text-[hsl(var(--muted-foreground))] opacity-60 font-mono">
          Created {formatDistanceToNow(new Date(team.createdAt))} ago
        </div>
      )}
    </div>
  )
}
