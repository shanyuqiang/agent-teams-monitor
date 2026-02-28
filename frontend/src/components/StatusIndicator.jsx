import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Connection status indicator component
 * @param {object} props
 * @param {boolean} props.isConnected
 * @param {string|null} props.error
 * @param {() => void} props.onReconnect
 */
export function StatusIndicator({ isConnected, error, onReconnect }) {
  if (error) {
    return (
      <button
        onClick={onReconnect}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-red-500/20 text-red-400 border border-red-500/30',
          'hover:bg-red-500/30',
          'transition-all text-sm font-medium font-mono',
          'shadow-[0_0_10px_rgba(239,68,68,0.3)]'
        )}
        title="Click to reconnect"
      >
        <WifiOff className="w-4 h-4" />
        <span>Disconnected</span>
      </button>
    )
  }

  if (isConnected) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30',
          'text-sm font-medium font-mono'
        )}
      >
        <Wifi className="w-4 h-4" />
        <span>Connected</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        'text-sm font-medium font-mono'
      )}
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Connecting...</span>
    </div>
  )
}
