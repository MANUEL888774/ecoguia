import type { Message } from '../../types'

interface MessageBubbleProps {
  message: Message
  onFeedback?: (helpful: boolean) => void
}

export default function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <li className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? 'bg-green-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        <p className="m-0 whitespace-pre-wrap">{message.text}</p>

        {/* Feedback buttons for bot messages */}
        {!isUser && onFeedback && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">¿Te fue útil?</span>
            <button
              aria-label="Sí, fue útil"
              onClick={() => onFeedback(true)}
              className="min-h-[44px] px-2 py-0.5 text-xs text-green-700 hover:bg-green-50 rounded focus:outline-none focus:ring-1 focus:ring-green-400 transition-colors"
            >
              👍 Sí
            </button>
            <button
              aria-label="No, no fue útil"
              onClick={() => onFeedback(false)}
              className="min-h-[44px] px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-1 focus:ring-red-300 transition-colors"
            >
              👎 No
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
