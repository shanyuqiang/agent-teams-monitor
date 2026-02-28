import { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  User,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

const STATUS_COLUMNS = {
  pending: {
    label: 'To Do',
    icon: Circle,
    color: 'text-[hsl(var(--muted-foreground))]',
    bgColor: 'bg-[hsl(var(--muted))]',
    borderColor: 'border-[hsl(var(--border))]',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  review: {
    label: 'Review',
    icon: AlertCircle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-[hsl(var(--primary))]',
    bgColor: 'bg-[hsl(var(--primary))]/10',
    borderColor: 'border-[hsl(var(--primary))]/30',
  },
}

/**
 * Task card component
 * @param {object} props
 * @param {object} props.task
 */
function TaskCard({ task }) {
  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  }

  return (
    <div
      className={cn(
        'p-3 rounded-lg bg-[hsl(var(--card))]',
        'border border-[hsl(var(--border))]',
        'hover:border-[hsl(var(--primary))]/50 hover:shadow-neon-sm transition-all',
        'cursor-pointer group'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-[hsl(var(--foreground))] text-sm line-clamp-2 font-mono">
          {task.title}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.priority && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded font-medium capitalize font-mono',
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] opacity-60">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[60px]">{task.assignee}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Task column component
 * @param {object} props
 * @param {string} props.status
 * @param {Array} props.tasks
 */
function TaskColumn({ status, tasks }) {
  const config = STATUS_COLUMNS[status] || STATUS_COLUMNS.pending
  const Icon = config.icon

  return (
    <div className="flex flex-col min-w-[280px] w-full">
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-t-lg',
          config.bgColor,
          'border-t border-x',
          config.borderColor
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', config.color)} />
          <span className="font-semibold text-sm text-[hsl(var(--foreground))] font-mono">
            {config.label}
          </span>
        </div>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            'bg-[hsl(var(--card))]',
            'text-[hsl(var(--muted-foreground))]'
          )}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div
        className={cn(
          'flex-1 p-3 space-y-3 min-h-[200px]',
          'bg-[hsl(var(--background))]/50',
          'border-b border-x rounded-b-lg',
          config.borderColor
        )}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
              No tasks
            </p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id || index}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard task={task} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Task board component
 * @param {object} props
 * @param {object} props.tasksByStatus
 */
export function TaskBoard({ tasksByStatus }) {
  const [viewMode, setViewMode] = useState('board') // board, list

  const statuses = Object.keys(STATUS_COLUMNS)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[hsl(var(--foreground))] font-mono">
          <span className="text-[hsl(var(--primary))]">#</span> Tasks
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
            Total:{' '}
            {Object.values(tasksByStatus).reduce(
              (acc, tasks) => acc + tasks.length,
              0
            )}
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-2">
          {statuses.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status] || []}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
