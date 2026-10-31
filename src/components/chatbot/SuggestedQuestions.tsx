import type { Faq } from '../../types'

interface SuggestedQuestionsProps {
  questions: Faq[]
  onSelect: (question: string) => void
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="px-3 py-2">
      <p className="text-xs text-gray-500 mb-2">Preguntas frecuentes:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((faq) => (
          <button
            key={faq.id}
            aria-label={faq.question}
            onClick={() => onSelect(faq.question)}
            className="min-h-[44px] px-3 py-1.5 text-sm bg-green-50 text-green-800 border border-green-200 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors text-left"
          >
            {faq.question}
          </button>
        ))}
      </div>
    </div>
  )
}
