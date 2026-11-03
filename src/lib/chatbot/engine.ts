import Fuse, { type FuseResult } from 'fuse.js'
import { normalize } from './normalize'
import type { Faq, BotResponse } from '../../types'

const FALLBACK_ANSWER =
  'Lo siento, no encontre una respuesta exacta. Puedes reformular tu pregunta? Aqui tienes algunas sugerencias:'

const STOPWORDS = new Set([
  'que','va','en','la','el','los','las','de','del',
  'un','una','se','y','o','a','por','para','con','al',
  'lo','le','su','es','son','hay','como',
])

function removeStopwords(text: string): string {
  return text.split(' ').filter((w) => w.length > 0 && !STOPWORDS.has(w)).join(' ')
}

function uniqueById(faqs: Faq[]): Faq[] {
  const seen = new Set<string>()
  return faqs.filter((f) => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return true
  })
}

function buildSuggestions(matched: Faq, allFaqs: Faq[], exclude: string[]): Faq[] {
  const related = (matched.related ?? [])
    .filter((id) => !exclude.includes(id))
    .map((id) => allFaqs.find((f) => f.id === id))
    .filter((f): f is Faq => f !== undefined)
    .slice(0, 3)
  return related
}

function buildFallback(allFaqs: Faq[], partialResults?: FuseResult<Faq>[]): BotResponse {
  const candidates = partialResults?.length
    ? partialResults.map((r) => r.item)
    : allFaqs
  const suggestions = uniqueById(candidates).slice(0, 3)
  return { type: 'fallback', answer: FALLBACK_ANSWER, suggestions }
}

function keywordOverlapMatch(queryWords: string[], faqs: Faq[]): Faq | undefined {
  let bestFaq: Faq | undefined
  let bestCount = 1
  for (const faq of faqs) {
    const faqKeywords = faq.keywords.map((k) => normalize(k))
    let count = 0
    for (const word of queryWords) {
      if (word.length < 3) continue
      if (faqKeywords.some((kw) => kw.includes(word) || word.includes(kw))) count++
    }
    if (count > bestCount) { bestCount = count; bestFaq = faq }
  }
  return bestFaq
}

export function search(query: string, faqs: Faq[]): BotResponse {
  const normalized = normalize(query)
  if (normalized === '') return buildFallback(faqs)
  const withoutStopwords = removeStopwords(normalized)
  const searchText = withoutStopwords.length > 0 ? withoutStopwords : normalized
  const fuse = new Fuse(faqs, {
    keys: [{ name: 'question', weight: 0.4 }, { name: 'keywords', weight: 0.6 }],
    threshold: 0.5,
    includeScore: true,
  })
  const results = fuse.search(searchText)
  if (results.length > 0 && (results[0]?.score ?? 1) <= 0.5) {
    const matchedFaq = results[0]!.item
    const suggestions = buildSuggestions(matchedFaq, faqs, [matchedFaq.id])
    return { type: 'answer', answer: matchedFaq.answer, matchedFaq, suggestions }
  }
  const queryWords = searchText.split(' ').filter((w) => w.length >= 3)
  const overlapMatch = keywordOverlapMatch(queryWords, faqs)
  if (overlapMatch) {
    const suggestions = buildSuggestions(overlapMatch, faqs, [overlapMatch.id])
    return { type: 'answer', answer: overlapMatch.answer, matchedFaq: overlapMatch, suggestions }
  }
  return buildFallback(faqs, results)
}
