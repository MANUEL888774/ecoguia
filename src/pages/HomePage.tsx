import categoriesData from '../data/categories.json'
import type { Category } from '../types'
import CategoryCard from '../components/guide/CategoryCard'
import { useChatbot } from '../hooks/useChatbot'

const categories = categoriesData as Category[]

const CURIOSIDADES = [
  {
    emoji: '♻️',
    titulo: 'Ahorro energético',
    texto: 'Reciclar una lata de aluminio ahorra suficiente energía para hacer funcionar un televisor durante 3 horas.',
  },
  {
    emoji: '🌊',
    titulo: 'Océanos libres',
    texto: 'Cada año llegan al océano más de 8 millones de toneladas de plástico. Reciclar y reducir el consumo ayuda a detener este flujo.',
  },
  {
    emoji: '🌳',
    titulo: 'Bosques protegidos',
    texto: 'Reciclar una tonelada de papel salva hasta 17 árboles y reduce el consumo de agua en un 50%.',
  },
]

export default function HomePage() {
  const { openChat } = useChatbot()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10" aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="text-4xl font-bold text-gray-900 mb-3">
          🌿 Guía de reciclaje para Colombia
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
          Aprende qué reciclar, cómo separar tus residuos y dónde llevarlos según las normas colombianas.
        </p>
        {/* Aviso municipal */}
        <div
          role="note"
          className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-xl mb-6"
        >
          <span aria-hidden="true">⚠️</span>
          <span>Las reglas de reciclaje varían según el municipio en Colombia.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#categorias"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            Ver guía completa
          </a>
          <button
            onClick={() => openChat()}
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 border-2 border-green-600 text-green-700 font-medium rounded-full hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            💬 Abrir chatbot
          </button>
        </div>
      </section>

      {/* Categorías */}
      <section id="categorias" aria-labelledby="categorias-heading" className="mb-12">
        <h2 id="categorias-heading" className="text-2xl font-semibold text-gray-800 mb-6">
          Categorías de reciclaje
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Curiosidades */}
      <section aria-labelledby="curiosidades-heading" className="mb-8">
        <h2 id="curiosidades-heading" className="text-2xl font-semibold text-gray-800 mb-6">
          ¿Sabías que…?
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CURIOSIDADES.map((c) => (
            <div
              key={c.titulo}
              className="bg-green-50 border border-green-100 rounded-2xl p-5"
            >
              <span className="text-3xl mb-3 block" aria-hidden="true">{c.emoji}</span>
              <h3 className="font-semibold text-gray-800 mb-1">{c.titulo}</h3>
              <p className="text-sm text-gray-600 m-0">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
