import { NavLink, Link } from 'react-router-dom'
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

export default function Navbar() {
  const { list } = useFavorites()
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-jojo-gray">
      <nav aria-label="Main navigation" className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <InlineLogo size={36} className="transition-transform duration-300 hover:rotate-12" />
          <span className="text-xl font-bold text-jojo-magenta tracking-tight">
            JoJo<span className="text-jojo-pink">Verse</span>
          </span>
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2">
          <li>
            <NavLink to="/explore" className={navClass}>
              Explore
            </NavLink>
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
            <NavLink to="/contact" className={navClass}>
              Contact
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
