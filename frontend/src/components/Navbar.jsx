import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext.jsx'
import InlineLogo from './InlineLogo.jsx'

const linkBase =
  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200'

function navClass({ isActive }) {
  return `${linkBase} ${
    isActive
      ? 'bg-jojo-pink text-white'
      : 'text-gray-700 hover:text-jojo-magenta hover:bg-jojo-gray/40'
  }`
}

function mobileLinkClass({ isActive }) {
  return `block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
    isActive
      ? 'bg-jojo-pink text-white'
      : 'text-gray-700 hover:text-jojo-magenta hover:bg-jojo-gray/40'
  }`
}

export default function Navbar() {
  const { list } = useFavorites()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close menu on navigation
  useState(() => { setOpen(false) }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-jojo-gray">
      <nav aria-label="Main navigation" className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <InlineLogo size={36} className="transition-transform duration-300 hover:rotate-12" />
          <span className="text-xl font-bold text-jojo-magenta tracking-tight">
            JoJo<span className="text-jojo-pink">Verse</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden sm:flex items-center gap-1 sm:gap-2">
          <li>
            <NavLink to="/explore" className={navClass}>Explore</NavLink>
          </li>
          <li>
            <NavLink to="/favorites" className={navClass}>
              Favorites
              {list.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-jojo-green text-[11px] font-bold text-gray-900">
                  {list.length}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={navClass}>Contact</NavLink>
          </li>
        </ul>

        {/* Hamburger button */}
        <button
          type="button"
          className="sm:hidden p-2 rounded-md text-gray-700 hover:text-jojo-magenta hover:bg-jojo-gray/40 transition-colors"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {open ? (
              <>
                <line x1="3" y1="3" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="19" y1="3" x2="3" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="sm:hidden border-t border-jojo-gray bg-white/95 backdrop-blur px-4 py-3 flex flex-col gap-1">
          <NavLink to="/explore" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Explore
          </NavLink>
          <NavLink to="/favorites" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Favorites
            {list.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-jojo-green text-[11px] font-bold text-gray-900">
                {list.length}
              </span>
            )}
          </NavLink>
          <NavLink to="/contact" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Contact
          </NavLink>
        </div>
      )}
    </header>
  )
}
