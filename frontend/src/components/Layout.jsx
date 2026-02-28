import { useState } from 'react'
import {
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { StatusIndicator } from './StatusIndicator'
import { TeamList } from './TeamList'
import { cn } from '@/utils/cn'

/**
 * Main layout component with sidebar
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {object} props.theme
 * @param {() => void} props.onToggleTheme
 * @param {object} props.connection
 * @param {object} props.teams
 * @param {(teamId: string) => void} props.onSelectTeam
 */
export function Layout({
  children,
  theme,
  onToggleTheme,
  connection,
  teams,
  onSelectTeam,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-40 h-16',
          'bg-white dark:bg-gray-800',
          'border-b border-gray-200 dark:border-gray-700',
          'flex items-center justify-between px-4',
          'transition-all duration-300',
          sidebarOpen ? 'lg:left-64' : 'left-0'
        )}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'text-gray-600 dark:text-gray-400'
            )}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'bg-gradient-to-br from-primary-500 to-primary-700'
              )}
            >
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100 hidden sm:block">
              Agent Teams Monitor
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <StatusIndicator
            isConnected={connection.isConnected}
            error={connection.connectionError}
            onReconnect={connection.reconnect}
          />

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'text-gray-600 dark:text-gray-400'
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

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 z-30 h-[calc(100vh-4rem)]',
          'bg-white dark:bg-gray-800',
          'border-r border-gray-200 dark:border-gray-700',
          'transition-all duration-300 overflow-hidden',
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Teams Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Teams
              </h2>
            </div>
            <TeamList
              teams={teams.teams}
              selectedTeamId={teams.selectedTeam?.id}
              onSelectTeam={onSelectTeam}
              isLoading={teams.isLoading}
            />
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <SidebarLink icon={Settings} label="Settings" />
            <SidebarLink icon={LogOut} label="Logout" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        )}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * Sidebar link component
 * @param {object} props
 * @param {React.ComponentType} props.icon
 * @param {string} props.label
 * @param {boolean} [props.active]
 */
function SidebarLink({ icon: Icon, label, active }) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
        'text-sm font-medium transition-colors',
        active
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
