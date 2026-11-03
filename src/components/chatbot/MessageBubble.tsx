import type { Message, Faq } from '../../types'

interface MessageBubbleProps {
  message: Message
  onFeedback?: (helpful: boolean) => void
  onSuggestionClick?: (question: string) => void
}

export default function MessageBubble({ message, onFeedback, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const hasSuggestions = !isUser && message.suggestions !== undefined && message.suggestions.length > 0

   return (
    <li className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? 'bg-green-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        <p className="m-0 whitespace-pre-wrap">{message.text}</p>
        {hasSuggestions && onSuggestionClick && (
          <div className='mt-2 pt-2 border-t border-gray-200 flex flex-col gap-1.5'>
            <span className='text-xs text-gray-500'>Quizas buscabas:</span>
            {(message.suggestions as Faq[]).map((faq) => (
              <button key={faq.id} aria-label={faq.question} onClick={() => onSuggestionClick(faq.question)} className='min-h-[44px] text-left text-xs px-3 py-1.5 bg-white border border-green-200 text-green-800 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors'>
                {faq.question}
              </button>
            ))}
          </div>
        )}
        {!isUser && onFeedback && (
          <div className='flex gap-2 mt-2 pt-2 border-t border-gray-200'>
            <span className='text-xs text-gray-500'>Te fue util?</span>
            <button aria-label='Si, fue util' onClick={() => onFeedback(true)} className='min-h-[44px] px-2 py-0.5 text-xs text-green-700 hover:bg-green-50 rounded focus:outline-none focus:ring-1 focus:ring-green-400 transition-colors'>Thumbs up Si</button>
            <button aria-label='No, no fue util' onClick={() => onFeedback(false)} className='min-h-[44px] px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-1 focus:ring-red-300 transition-colors'>Thumbs down No</button>
          </div>
        )}
      </div>
    </li>
  )
}

