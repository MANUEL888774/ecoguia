import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from '../chatbot/ChatWidget'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-green-800 focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* ChatWidget siempre montado para preservar historial entre rutas */}
      <ChatWidget />
    </div>
  )
}
