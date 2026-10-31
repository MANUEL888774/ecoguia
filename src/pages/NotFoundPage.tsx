import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-4" aria-hidden="true">🌿</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 mb-6">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="min-h-[44px] inline-flex items-center px-5 py-2.5 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
