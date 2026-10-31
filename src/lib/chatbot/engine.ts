import Fuse, { type FuseResult } from 'fuse.js'
import { normalize } from './normalize'
import type { Faq, BotResponse } from '../../types'

const FALLBACK_ANSWER =
  'Lo siento, no encontré una respuesta exacta. ¿Puedes reformular tu pregunta? Aquí tienes algunas sugerencias:'

function uniqueById(faqs: Faq[]): Faq[] {
  const seen = new Set<string>()
  return faqs.filter((f) => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return true
  })
}

function buildSuggestions(
  matched: Faq,
  allFaqs: Faq[],
  exclude: string[],
): Faq[] {
  const related = (matched.related ?? [])
    .filter((id) => !exclude.includes(id))
    .map((id) => allFaqs.find((f) => f.id === id))
    .filter((f): f is Faq => f !== undefined)
    .slice(0, 3)
  return related
}

function buildFallback(
  allFaqs: Faq[],
  partialResults?: FuseResult<Faq>[],
): BotResponse {
  const candidates = partialResults?.length
    ? partialResults.map((r) => r.item)
    : allFaqs
  const suggestions = uniqueById(candidates).slice(0, 3)
  return {
    type: 'fallback',
    answer: FALLBACK_ANSWER,
    suggestions,
  }
}

export function search(query: string, faqs: Faq[]): BotResponse {
  const normalized = normalize(query)

  if (normalized === '') {
    return buildFallback(faqs)
  }

  const fuse = new Fuse(faqs, {
    keys: [
      { name: 'question', weight: 0.5 },
      { name: 'keywords', weight: 0.5 },
    ],
    threshold: 0.5,
    includeScore: true,
  })

  const results = fuse.search(normalized)

  if (results.length > 0 && (results[0]?.score ?? 1) <= 0.5) {
    const matchedFaq = results[0]!.item
    const suggestions = buildSuggestions(matchedFaq, faqs, [matchedFaq.id])
    return {
      type: 'answer',
      answer: matchedFaq.answer,
      matchedFaq,
      suggestions,
    }
  }

  return buildFallback(faqs, results)
}
