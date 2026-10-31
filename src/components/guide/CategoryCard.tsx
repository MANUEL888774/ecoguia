import { Link } from 'react-router-dom'
import type { Category } from '../../types'

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article
      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-shadow"
    >
      <Link
        to={`/guia/${category.id}`}
        className="flex flex-col items-center p-5 gap-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-400 rounded-2xl"
        aria-label={`Ver guía de ${category.name}`}
      >
        {/* Color accent bar */}
        <div
          className="w-full h-2 rounded-full"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />

        {/* Icon */}
        <span
          className="text-4xl"
          aria-hidden="true"
          role="img"
        >
          {category.icon}
        </span>

        {/* Name */}
        <h2 className="text-base font-semibold text-gray-800 m-0 text-center">
          {category.name}
        </h2>

        {/* Brief description */}
        <p className="text-sm text-gray-500 text-center m-0 line-clamp-2">
          {category.description}
        </p>

        {/* Bin color badge */}
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
          Bolsa {category.binColor}
        </span>
      </Link>
    </article>
  )
}
