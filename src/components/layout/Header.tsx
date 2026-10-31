import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-green-700 text-white'
        : 'text-green-100 hover:bg-green-700 hover:text-white'
    }`

  return (
    <header className="bg-green-800 shadow-md">
      <nav className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          to="/"
          className="text-white font-bold text-xl tracking-tight hover:text-green-200 transition-colors"
        >
          🌿 EcoGuía
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-2 list-none m-0 p-0">
          <li>
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/guia" className={navLinkClass}>
              Guía
            </NavLink>
          </li>
        </ul>

        {/* Hamburger (mobile) */}
        <button
          className="md:hidden text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <ul
          id="mobile-menu"
          className="md:hidden bg-green-900 px-4 pb-3 pt-1 flex flex-col gap-1 list-none m-0"
        >
          <li>
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/guia"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Guía
            </NavLink>
          </li>
        </ul>
      )}
    </header>
  )
}
