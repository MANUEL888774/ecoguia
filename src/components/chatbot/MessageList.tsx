import { useEffect, useRef } from 'react'
import type { Message, Faq } from '../../types'
import MessageBubble from './MessageBubble'
import SuggestedQuestions from './SuggestedQuestions'

interface MessageListProps {
  messages: Message[]
  isTyping: boolean
  suggestedFaqs: Faq[]
  onSuggestedClick: (question: string) => void
  onFeedback: (messageId: string, helpful: boolean) => void
}

export default function MessageList({
  messages,
  isTyping,
  suggestedFaqs,
  onSuggestedClick,
  onFeedback,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    endRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    })
  }, [messages, isTyping])
  const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <div className="flex-1 overflow-y-auto px-3 py-2">
      {messages.length === 0 && (
        <SuggestedQuestions questions={suggestedFaqs} onSelect={onSuggestedClick} />
      )}

      <ul
        aria-live="polite"
        aria-label="Mensajes del chat"
        className="list-none m-0 p-0"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onFeedback={
              msg.role === 'bot'
                ? (helpful) => onFeedback(msg.id, helpful)
                : undefined
            }
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <li className="flex justify-start mb-2" aria-label="EcoGuía está escribiendo">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              {prefersReducedMotion ? (
                <span className="text-sm text-gray-500">Escribiendo…</span>
              ) : (
                <span className="flex gap-1 items-center" aria-hidden="true">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </li>
        )}
      </ul>

      <div ref={endRef} />
    </div>
  )
}
