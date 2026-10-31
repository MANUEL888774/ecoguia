import type { Category, Faq } from '../../types'

interface CategoryDetailProps {
  category: Category
  relatedFaqs: Faq[]
  onAskBot: (question: string) => void
}

export default function CategoryDetail({ category, relatedFaqs, onAskBot }: CategoryDetailProps) {
  return (
    <article className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl" aria-hidden="true" role="img">
          {category.icon}
        </span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0">{category.name}</h1>
          <span
            className="inline-block mt-1 text-sm px-3 py-0.5 rounded-full text-white font-medium capitalize"
            style={{ backgroundColor: category.color }}
          >
            Bolsa {category.binColor}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-8">{category.description}</p>

      {/* Accepts */}
      <section className="mb-6" aria-labelledby="accepts-heading">
        <h2 id="accepts-heading" className="text-lg font-semibold text-gray-800 mb-3">
          ✅ Qué SÍ acepta
        </h2>
        <ul className="space-y-1 list-none p-0">
          {category.accepts.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5 shrink-0" aria-hidden="true">✅</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Rejects */}
      <section className="mb-6" aria-labelledby="rejects-heading">
        <h2 id="rejects-heading" className="text-lg font-semibold text-gray-800 mb-3">
          ❌ Qué NO acepta
        </h2>
        <ul className="space-y-1 list-none p-0">
          {category.rejects.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-red-500 mt-0.5 shrink-0" aria-hidden="true">❌</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Tips */}
      <section className="mb-8" aria-labelledby="tips-heading">
        <h2 id="tips-heading" className="text-lg font-semibold text-gray-800 mb-3">
          💡 Consejos
        </h2>
        <ul className="space-y-2 list-none p-0">
          {category.tips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2"
            >
              <span className="text-green-600 shrink-0 mt-0.5" aria-hidden="true">💡</span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Related FAQs */}
      {relatedFaqs.length > 0 && (
        <section aria-labelledby="faqs-heading">
          <h2 id="faqs-heading" className="text-lg font-semibold text-gray-800 mb-3">
            Preguntas frecuentes
          </h2>
          <ul className="space-y-3 list-none p-0">
            {relatedFaqs.map((faq) => (
              <li key={faq.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="font-medium text-sm text-gray-800 m-0 mb-2">{faq.question}</p>
                <p className="text-sm text-gray-600 m-0 mb-3">{faq.answer}</p>
                <button
                  onClick={() => onAskBot(faq.question)}
                  className="min-h-[44px] text-xs px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                >
                  Preguntar al bot
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
