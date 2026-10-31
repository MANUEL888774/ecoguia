import categoriesData from '../data/categories.json'
import type { Category } from '../types'
import CategoryCard from '../components/guide/CategoryCard'

const categories = categoriesData as Category[]

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Guía de reciclaje</h1>
      <p className="text-gray-500 mb-8">
        Selecciona una categoría para saber qué puedes reciclar y cómo hacerlo correctamente.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  )
}
