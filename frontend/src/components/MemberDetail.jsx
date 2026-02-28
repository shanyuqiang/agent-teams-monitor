import { X, User, Brain, Cpu, Folder, Calendar, MessageSquare, Hash } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Member detail panel component
 * @param {object} props
 * @param {object} props.member - Member object with full details
 * @param {() => void} props.onClose - Close handler
 */
export function MemberDetail({ member, onClose }) {
  if (!member) return null

  const colorClasses = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-[hsl(var(--primary))] to-[hsl(var(--primary))/80]',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
    pink: 'from-pink-500 to-pink-700',
    orange: 'from-orange-500 to-orange-700',
    red: 'from-red-500 to-red-700',
  }

  const colorTextClasses = {
    blue: 'text-blue-400',
    green: 'text-[hsl(var(--primary))]',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
  }

  const formatTimestamp = (ts) => {
    if (!ts) return '-'
    const date = new Date(ts)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const memberId = member.name || member.id || member.agentId

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--card))] border-l border-[hsl(var(--border))]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        <h3 className="font-semibold text-[hsl(var(--foreground))] font-mono">
          <span className="text-[hsl(var(--primary))]">#</span> Member Details
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[hsl(var(--primary))]/10 text-[hsl(var(--muted-foreground))] transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold',
              `bg-gradient-to-br ${colorClasses[member.color] || 'from-gray-500 to-gray-700'}`,
              member.color === 'green' && 'shadow-neon'
            )}
          >
            {member.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-[hsl(var(--foreground))] font-mono">
              {member.name}
            </h4>
            <p className={cn('text-sm font-medium', colorTextClasses[member.color] || 'text-[hsl(var(--muted-foreground))]')}>
              {member.agentType || 'Agent'}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Model */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <Brain className="w-5 h-5 text-[hsl(var(--primary))] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Model</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate font-mono">
                {member.model || '-'}
              </p>
            </div>
          </div>

          {/* Agent ID */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <Hash className="w-5 h-5 text-[hsl(var(--primary))] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Agent ID</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate font-mono">
                {member.agentId || '-'}
              </p>
            </div>
          </div>

          {/* Working Directory */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <Folder className="w-5 h-5 text-[hsl(var(--primary))] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Working Directory</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate font-mono text-xs">
                {member.cwd || '-'}
              </p>
            </div>
          </div>

          {/* Joined Time */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <Calendar className="w-5 h-5 text-[hsl(var(--primary))] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Joined At</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))] font-mono">
                {formatTimestamp(member.joinedAt)}
              </p>
            </div>
          </div>

          {/* Backend Type */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <Cpu className="w-5 h-5 text-[hsl(var(--primary))] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Backend Type</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))] font-mono">
                {member.backendType || 'in-process'}
              </p>
            </div>
          </div>
        </div>

        {/* Prompt / Task Description */}
        {member.prompt && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
              <MessageSquare className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span>Task / Prompt</span>
            </div>
            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
              <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap font-mono">
                {member.prompt}
              </p>
            </div>
          </div>
        )}

        {/* Subscriptions */}
        {member.subscriptions && member.subscriptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              Subscriptions
            </p>
            <div className="flex flex-wrap gap-2">
              {member.subscriptions.map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs rounded-full bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30 font-mono"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Plan Mode */}
        {member.planModeRequired !== undefined && (
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-1 text-xs rounded-full font-mono',
              member.planModeRequired
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30'
            )}>
              {member.planModeRequired ? 'Plan Mode Required' : 'Plan Mode Not Required'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
