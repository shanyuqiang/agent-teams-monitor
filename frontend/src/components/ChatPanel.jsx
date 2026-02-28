import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Bot, User, AlertCircle, Info } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

/**
 * Parse protocol messages (JSON wrapped in text field)
 * @param {object} message
 * @returns {object}
 */
function parseMessage(message) {
  try {
    if (message.text && typeof message.text === 'string' && message.text.startsWith('{')) {
      const parsed = JSON.parse(message.text)
      return {
        ...message,
        isProtocol: true,
        protocolType: parsed.type,
        parsedContent: parsed
      }
    }
  } catch (e) {
    // Not a JSON message, treat as normal text
  }
  return { ...message, isProtocol: false }
}

/**
 * Get icon and color for protocol message types
 * @param {string} type
 */
function getProtocolStyles(type) {
  const styles = {
    idle_notification: { icon: Info, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
    shutdown_request: { icon: AlertCircle, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
    shutdown_approved: { icon: AlertCircle, color: 'text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/20 border-[hsl(var(--primary))]/30' },
    task_update: { icon: Info, color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
  }
  return styles[type] || { icon: Info, color: 'text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]' }
}

/**
 * Chat panel component showing messages
 * @param {object} props
 * @param {object|null} props.team
 * @param {string|null} props.selectedMemberId
 * @param {Array} props.messages
 * @param {() => void} props.onClear
 */
export function ChatPanel({ team, selectedMemberId, messages, onClear, tasks, onShowMemberDetail, onShowSpecificMemberDetail }) {
  const messagesEndRef = useRef(null)
  const [inputText, setInputText] = useState('')

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Parse all messages
  const parsedMessages = messages.map(parseMessage)

  // Get selected member info (match by name since msg.from uses name)
  const selectedMember = selectedMemberId
    ? team?.config?.members?.find(m => m.name === selectedMemberId || m.agentId === selectedMemberId || m.id === selectedMemberId)
    : null

  // Get unique conversation partners for the selected member
  const conversationPartners = selectedMemberId
    ? [...new Set(messages.map(msg => {
        if (msg.from === selectedMemberId) {
          // Member sent this message, recipient is in _sourceFile
          const match = msg._sourceFile?.match(/\/inboxes\/([^.]+)\.json$/)
          return match ? match[1] : null
        } else {
          // Member received this message, sender is msg.from
          return msg.from
        }
      }).filter(Boolean))]
    : []

  const getMemberColor = (memberId) => {
    const member = team?.config?.members?.find(m => m.name === memberId || m.agentId === memberId || m.id === memberId)
    return member?.color || 'gray'
  }

  const getMemberName = (memberId) => {
    const member = team?.config?.members?.find(m => m.name === memberId || m.agentId === memberId || m.id === memberId)
    return member?.name || memberId
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Bot className="w-16 h-16 text-[hsl(var(--primary))] opacity-30 mb-4" />
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2 font-mono">
          <span className="text-[hsl(var(--primary))]">&gt;</span> Welcome to Agent Teams
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] max-w-md font-mono">
          Select a discussion group from the left to start viewing conversations between agents.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          {selectedMemberId ? (
            <>
              <button
                onClick={onShowMemberDetail}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-transform hover:scale-105',
                  selectedMember?.color === 'blue' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                  selectedMember?.color === 'green' && 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30',
                  selectedMember?.color === 'yellow' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                  selectedMember?.color === 'purple' && 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
                  !selectedMember?.color && 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                )}
                title="View member details"
              >
                {selectedMember?.name?.charAt(0).toUpperCase() || 'A'}
              </button>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] font-mono">
                  {selectedMember?.name || selectedMemberId}
                  {conversationPartners.length > 0 && (
                    <span className="text-[hsl(var(--primary))] ml-1">
                      → {conversationPartners.join(', ')}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {parsedMessages.length} messages
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] shadow-neon-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] font-mono">
                  All Members
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {team.config?.members?.length || 0} members · {parsedMessages.length} messages
                </p>
              </div>
            </>
          )}
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {parsedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-12 h-12 text-[hsl(var(--primary))] opacity-30 mb-3" />
            <p className="text-[hsl(var(--muted-foreground))] font-mono">
              {selectedMemberId
                ? `No messages from ${selectedMember?.name || selectedMemberId} yet`
                : 'No messages in this team yet'
              }
            </p>
          </div>
        ) : (
          parsedMessages.map((message, index) => {
            // 当前选中的member发送的消息显示在右侧
            const isOwn = selectedMemberId ? message.from === selectedMemberId : false
            const color = getMemberColor(message.from)
            const senderName = getMemberName(message.from)

            // 获取接收者
            const recipientMatch = message._sourceFile?.match(/\/inboxes\/([^.]+)\.json$/)
            const recipient = recipientMatch ? recipientMatch[1] : null

            // All Messages 视图下显示所有接收者，或特定成员视图下显示发给当前成员的
            const showRecipient = !selectedMemberId || (selectedMemberId && recipient)

            return (
              <div
                key={message.id || index}
                className={cn(
                  'flex gap-3 animate-slide-in',
                  isOwn && 'flex-row-reverse'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Avatar with click event */}
                <button
                  onClick={() => onShowSpecificMemberDetail?.(message.from)}
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-transform hover:scale-110',
                    color === 'blue' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                    color === 'green' && 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30',
                    color === 'yellow' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                    color === 'purple' && 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
                    color === 'gray' && 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                  )}
                  title={`View ${senderName}'s profile`}
                >
                  {senderName.charAt(0).toUpperCase()}
                </button>

                {/* Message Content */}
                <div className={cn(
                  'flex-1 max-w-[80%]',
                  isOwn && 'text-right'
                )}>
                  {/* Sender Name & Time */}
                  <div className={cn(
                    'flex items-center gap-2 mb-1',
                    isOwn && 'flex-row-reverse'
                  )}>
                    <span className="text-sm font-medium text-[hsl(var(--foreground))] font-mono">
                      {senderName}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] opacity-60">
                      {message.timestamp && format(new Date(message.timestamp), 'HH:mm')}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    'inline-block text-left px-4 py-2 rounded-2xl border',
                    isOwn
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-tr-sm shadow-neon-sm'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-tl-sm border-[hsl(var(--border))]',
                    message.isProtocol && 'bg-opacity-50'
                  )}>
                    {message.isProtocol ? (
                      <ProtocolMessage message={message} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.text}
                        {/* All Messages 视图下显示 @接收者，或特定成员视图下发给当前成员的 */}
                        {showRecipient && recipient && (
                          <span className="text-blue-500 font-medium"> @{recipient}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Read-only for now) */}
      <div className="px-6 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message viewing is read-only..."
            disabled
            className="flex-1 px-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] cursor-not-allowed font-mono"
          />
          <button
            disabled
            className="p-2 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-lg cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Protocol message display
 * @param {object} props
 * @param {object} props.message
 */
function ProtocolMessage({ message }) {
  const { protocolType, parsedContent } = message
  const { icon: Icon, color } = getProtocolStyles(protocolType)

  return (
    <div className={cn('flex items-start gap-2 px-3 py-2 rounded-lg border', color)}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <span className="font-medium font-mono">{protocolType.replace(/_/g, ' ')}</span>
        {parsedContent.idleReason && (
          <span className="ml-2 text-xs opacity-75">({parsedContent.idleReason})</span>
        )}
      </div>
    </div>
  )
}
