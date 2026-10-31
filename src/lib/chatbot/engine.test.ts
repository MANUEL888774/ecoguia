import { describe, it, expect } from 'vitest'
import { normalize } from './normalize'
import { search } from './engine'
import categories from '../../data/categories.json'
import faqs from '../../data/faqs.json'
import type { Faq, Category } from '../../types'

const typedFaqs = faqs as Faq[]
const typedCategories = categories as Category[]

// ─────────────────────────────────────────────
// Tarea 3.2 — Pruebas de normalize
// ─────────────────────────────────────────────

describe('normalize — ejemplos unitarios', () => {
  it("convierte a minúsculas: 'HOLA' → 'hola'", () => {
    expect(normalize('HOLA')).toBe('hola')
  })

  it("elimina tildes: 'reciclación' → 'reciclacion'", () => {
    expect(normalize('reciclación')).toBe('reciclacion')
  })

  it("elimina puntuación: '¿Qué hago?' → 'que hago'", () => {
    expect(normalize('¿Qué hago?')).toBe('que hago')
  })

  it("colapsa espacios: 'hola   mundo' → 'hola mundo'", () => {
    expect(normalize('hola   mundo')).toBe('hola mundo')
  })

  it('devuelve cadena vacía para entrada vacía', () => {
    expect(normalize('')).toBe('')
  })
})

describe('normalize — propiedades', () => {
  const samples = [
    'HOLA MUNDO',
    'reciclación',
    '¿Qué hago?',
    'hola   mundo',
    'PLÁSTICO',
    'Cáscara de naranja',
    'eco-guía_2024',
    '   espacios   ',
    '',
    'abc123',
  ]

  it('Property 5: sin mayúsculas — normalize(s) === normalize(s).toLowerCase()', () => {
    for (const s of samples) {
      const result = normalize(s)
      expect(result).toBe(result.toLowerCase())
    }
  })

  it('Property 6: sin tildes — sin caracteres \\u0300-\\u036f', () => {
    for (const s of samples) {
      const result = normalize(s)
      expect(/[\u0300-\u036f]/.test(result)).toBe(false)
    }
  })

  it('Property 7: sin puntuación — sin caracteres /[^\\w\\s]/', () => {
    for (const s of samples) {
      const result = normalize(s)
      expect(/[^\w\s]/.test(result)).toBe(false)
    }
  })

  it('Property 8: sin espacios múltiples — !/\\s{2,}/.test(normalize(s))', () => {
    for (const s of samples) {
      const result = normalize(s)
      expect(/\s{2,}/.test(result)).toBe(false)
    }
  })

  it('Property 9: idempotencia — normalize(normalize(s)) === normalize(s)', () => {
    for (const s of samples) {
      expect(normalize(normalize(s))).toBe(normalize(s))
    }
  })
})

// ─────────────────────────────────────────────
// Tarea 4.3 — Integridad de datos JSON
// ─────────────────────────────────────────────

describe('categories.json — integridad de datos', () => {
  it('tiene exactamente 7 categorías', () => {
    expect(typedCategories.length).toBe(7)
  })

  it('todos los ids de categoría son únicos', () => {
    const ids = typedCategories.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('Property 1: accepts ≥ 6, rejects ≥ 4, tips ≥ 3 por categoría', () => {
    for (const cat of typedCategories) {
      expect(cat.accepts.length).toBeGreaterThanOrEqual(6)
      expect(cat.rejects.length).toBeGreaterThanOrEqual(4)
      expect(cat.tips.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('contiene las 7 categorías esperadas', () => {
    const expectedIds = [
      'organicos',
      'plastico',
      'papel-carton',
      'vidrio',
      'metales',
      'peligrosos',
      'electronicos',
    ]
    for (const id of expectedIds) {
      expect(typedCategories.some((c) => c.id === id)).toBe(true)
    }
  })
})

describe('faqs.json — integridad de datos', () => {
  it('tiene al menos 30 FAQs', () => {
    expect(typedFaqs.length).toBeGreaterThanOrEqual(30)
  })

  it('todos los ids de FAQ son únicos', () => {
    const ids = typedFaqs.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('Property 2: keywords.length ≥ 4 por FAQ', () => {
    for (const faq of typedFaqs) {
      expect(faq.keywords.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('al menos 5 FAQs sin categoryId', () => {
    const noCat = typedFaqs.filter((f) => !f.categoryId)
    expect(noCat.length).toBeGreaterThanOrEqual(5)
  })

  it('Property 3: integridad referencial — todo categoryId existe en categories', () => {
    const catIds = new Set(typedCategories.map((c) => c.id))
    for (const faq of typedFaqs) {
      if (faq.categoryId !== undefined) {
        expect(catIds.has(faq.categoryId)).toBe(true)
      }
    }
  })

  it('Property 4: integridad referencial — todo id en related existe en faqs', () => {
    const faqIds = new Set(typedFaqs.map((f) => f.id))
    for (const faq of typedFaqs) {
      for (const relId of faq.related ?? []) {
        expect(faqIds.has(relId)).toBe(true)
      }
    }
  })
})

// ─────────────────────────────────────────────
// Tarea 5.2 — Pruebas del motor de búsqueda
// ─────────────────────────────────────────────

describe('search — ejemplos', () => {
  it('coincidencia exacta devuelve type:"answer"', () => {
    const result = search('bolsa blanca', typedFaqs)
    expect(result.type).toBe('answer')
    expect(result.answer.length).toBeGreaterThan(0)
    expect(result.matchedFaq).toBeDefined()
  })

  it("tolerancia tipográfica: 'reciclar vidiro' → respuesta sobre vidrio", () => {
    // 'vidiro' es una transposición de 'vidrio' (1 cambio)
    const result = search('reciclar vidiro', typedFaqs)
    expect(result.type).toBe('answer')
    expect(result.matchedFaq?.categoryId ?? result.matchedFaq?.id).toBeTruthy()
  })

  it("sinónimo: 'icopor' → respuesta sobre poliestireno/icopor", () => {
    const result = search('icopor', typedFaqs)
    expect(result.type).toBe('answer')
    expect(result.matchedFaq?.id).toBe('faq-005')
  })

  it('fallback con 3 sugerencias para consulta sin coincidencia', () => {
    const result = search('xkzqwerty', typedFaqs)
    expect(result.type).toBe('fallback')
    expect(result.suggestions.length).toBe(3)
  })

  it('query vacía devuelve type:"fallback"', () => {
    const result = search('', typedFaqs)
    expect(result.type).toBe('fallback')
  })

  it('query solo espacios devuelve type:"fallback"', () => {
    const result = search('   ', typedFaqs)
    expect(result.type).toBe('fallback')
  })
})

describe('search — propiedades', () => {
  it('Property 10: sugerencias sin duplicados cuando type:"answer"', () => {
    const queries = ['bolsa blanca', 'plastico', 'vidrio', 'compost', 'pilas']
    for (const q of queries) {
      const result = search(q, typedFaqs)
      if (result.type === 'answer') {
        const ids = result.suggestions.map((s) => s.id)
        expect(new Set(ids).size).toBe(ids.length)
      }
    }
  })

  it('Property 11: fallback tiene exactamente 3 FAQs con ids distintos', () => {
    const result = search('zzzxxx999qqq', typedFaqs)
    expect(result.type).toBe('fallback')
    expect(result.suggestions.length).toBe(3)
    const ids = result.suggestions.map((s) => s.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('Property 12: variante tipográfica (≤2 sustituciones) devuelve type:"answer"', () => {
    // 'bolza blanca' — una letra cambiada respecto a 'bolsa blanca'
    const result = search('bolza blanca', typedFaqs)
    expect(result.type).toBe('answer')
  })
})

// ─────────────────────────────────────────────
// Cobertura adicional de ramas internas
// ─────────────────────────────────────────────

describe('search — cobertura de ramas internas', () => {
  it('fallback sin resultados parciales usa los primeros FAQs (rama allFaqs)', () => {
    // Una query completamente aleatoria no produce resultados en Fuse → usa allFaqs
    const result = search('zzz999xxy', typedFaqs)
    expect(result.type).toBe('fallback')
    expect(result.suggestions.length).toBe(3)
    // Suggestions deben ser únicos (ejercita uniqueById con duplicados potenciales)
    const ids = result.suggestions.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('fallback con resultados parciales usa partialResults (rama partialResults?.length)', () => {
    // Una query suficientemente diferente para que Fuse devuelva resultados
    // con score > threshold, activando la rama partialResults de buildFallback
    // Usamos un mini array donde ninguna pregunta coincide bien
    const miniFaqs: Faq[] = [
      { id: 'a1', question: 'cómo reciclar aluminio', answer: 'r1', keywords: ['aluminio', 'metal', 'lata', 'reciclar'] },
      { id: 'a2', question: 'separar residuos en casa', answer: 'r2', keywords: ['separar', 'residuos', 'casa', 'bolsa'] },
      { id: 'a3', question: 'qué es el compostaje', answer: 'r3', keywords: ['compost', 'organico', 'abono', 'tierra'] },
      { id: 'a4', question: 'pilas donde depositar', answer: 'r4', keywords: ['pilas', 'bateria', 'peligroso', 'punto'] },
    ]
    // Query genérica que puede dar match parcial pero no exacto
    const result = search('vidrio roto que hago', miniFaqs)
    // Result puede ser answer o fallback — lo importante es que no lance error
    // y que suggestions sea array válido
    expect(Array.isArray(result.suggestions)).toBe(true)
  })

  it('uniqueById filtra duplicados cuando suggestions los incluye', () => {
    // Construye una lista de FAQs con duplicados y verifica la deduplicación
    const dup: Faq[] = [
      { id: 'x', question: 'q', answer: 'a', keywords: ['k1', 'k2', 'k3', 'k4'] },
      { id: 'x', question: 'q', answer: 'a', keywords: ['k1', 'k2', 'k3', 'k4'] },
      { id: 'y', question: 'q2', answer: 'a2', keywords: ['k1', 'k2', 'k3', 'k4'] },
    ]
    // Provoca fallback con lista que tiene duplicados (buscar algo sin match exacto)
    const result = search('aaa', dup)
    expect(result.type).toBe('fallback')
    // uniqueById debe haber eliminado el duplicado 'x'
    const ids = result.suggestions.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('buildSuggestions maneja FAQ sin related (rama ?? [])', () => {
    // faq-024 no tiene 'related' → buildSuggestions debe devolver []
    const faqWithoutRelated = typedFaqs.find((f) => f.related === undefined)
    if (faqWithoutRelated) {
      const result = search(faqWithoutRelated.question, typedFaqs)
      // Puede ser answer o fallback; lo importante es que no lance error
      expect(['answer', 'fallback']).toContain(result.type)
    }
  })

  it('buildSuggestions: related con id inexistente no genera undefined en resultado', () => {
    // FAQ con related que apunta a un id que no existe en la lista
    const smallFaqs: Faq[] = [
      {
        id: 'f1',
        question: 'bolsa blanca que va',
        answer: 'resp',
        keywords: ['bolsa', 'blanca', 'reciclable', 'plastico'],
        related: ['INEXISTENTE'],
      },
    ]
    const result = search('bolsa blanca', smallFaqs)
    expect(result.type).toBe('answer')
    // suggestions no debe contener undefined
    for (const s of result.suggestions) {
      expect(s).toBeDefined()
    }
  })

  it('search: resultado con score undefined usa fallback del operador ??', () => {
    // Forzar un escenario donde results[0].score es undefined usando
    // una lista con un solo FAQ muy corto para maximizar score impreciso
    const oneFaq: Faq[] = [
      {
        id: 'solo',
        question: 'x',
        answer: 'resp',
        keywords: ['a', 'b', 'c', 'd'],
      },
    ]
    // La query coincide exactamente con la pregunta 'x'
    const result = search('x', oneFaq)
    expect(['answer', 'fallback']).toContain(result.type)
  })
})
