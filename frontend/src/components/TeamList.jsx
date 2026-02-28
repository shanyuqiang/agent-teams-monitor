import { Users, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Team list item component
 * @param {object} props
 * @param {object} props.team
 * @param {boolean} props.isSelected
 * @param {() => void} props.onSelect
 */
function TeamListItem({ team, isSelected, onSelect }) {
  const memberCount = team.config?.members?.length || team.members?.length || 0

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left',
        'transition-all duration-200',
        'hover:bg-[hsl(var(--primary))]/10',
        isSelected && 'bg-[hsl(var(--primary))]/20 border-r-2 border-[hsl(var(--primary))]',
        'hover:shadow-neon-sm'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          'bg-[hsl(var(--primary))]',
          'text-[hsl(var(--primary-foreground))] font-semibold text-sm',
          'shadow-neon-sm'
        )}
      >
        {team.name?.charAt(0).toUpperCase() || 'T'}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-[hsl(var(--foreground))] truncate font-mono">
          {team.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
          <Users className="w-3.5 h-3.5" />
          <span>{memberCount} members</span>
        </div>
      </div>

      <ChevronRight
        className={cn(
          'w-5 h-5 text-[hsl(var(--muted-foreground))] transition-transform duration-200',
          isSelected && 'rotate-90 text-[hsl(var(--primary))]'
        )}
      />
    </button>
  )
}

/**
 * Team list sidebar component
 * @param {object} props
 * @param {Array} props.teams
 * @param {string|null} props.selectedTeamId
 * @param {(teamId: string) => void} props.onSelectTeam
 * @param {boolean} props.isLoading
 */
export function TeamList({ teams, selectedTeamId, onSelectTeam, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 animate-pulse"
          >
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[hsl(var(--muted))] rounded w-3/4" />
              <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-[hsl(var(--primary))] opacity-30 mb-3" />
        <p className="text-[hsl(var(--muted-foreground))] text-sm font-mono">
          No teams available
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[hsl(var(--border))]">
      {teams.map((team) => (
        <TeamListItem
          key={team.id}
          team={team}
          isSelected={team.id === selectedTeamId}
          onSelect={() => onSelectTeam(team.id)}
        />
      ))}
    </div>
  )
}
