import { useEffect, useRef, type RefObject } from 'react'
import type { Message, Faq } from '../../types'
import MessageList from './MessageList'
import ChatInput from './ChatInput'

interface ChatWindowProps {
  messages: Message[]
  isTyping: boolean
  suggestedFaqs: Faq[]
  onSend: (text: string) => void
  onClose: () => void
  onClear: () => void
  onSuggestedClick: (question: string) => void
  onFeedback: (messageId: string, helpful: boolean) => void
  inputRef: RefObject<HTMLInputElement>
}

export default function ChatWindow({
  messages,
  isTyping,
  suggestedFaqs,
  onSend,
  onClose,
  onClear,
  onSuggestedClick,
  onFeedback,
  inputRef,
}: ChatWindowProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus trap + Escape handler
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    inputRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    panel.addEventListener('keydown', handleKeyDown)
    return () => panel.removeEventListener('keydown', handleKeyDown)
  }, [onClose, inputRef])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Asistente de EcoGuía"
      aria-modal="true"
      id="chat-panel"
      className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-green-700 text-white shrink-0">
        <div className="flex items-center gap-2">
          <span aria-hidden="true">🌿</span>
          <h2 className="text-sm font-semibold m-0">EcoGuía Bot</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="text-xs text-green-200 hover:text-white px-2 py-1 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors min-h-[44px]"
            aria-label="Limpiar conversación"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            aria-label="Cerrar chat"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isTyping={isTyping}
        suggestedFaqs={suggestedFaqs}
        onSuggestedClick={onSuggestedClick}
        onFeedback={onFeedback}
      />

      {/* Input */}
      <ChatInput onSend={onSend} inputRef={inputRef} disabled={isTyping} />
    </div>
  )
}
