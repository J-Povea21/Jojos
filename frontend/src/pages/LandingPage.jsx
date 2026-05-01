import { Link } from 'react-router-dom'
import InlineLogo from '../components/InlineLogo.jsx'

export default function LandingPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-jojo-pink/10 via-jojo-blue/10 to-jojo-green/10" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 lg:py-36 flex flex-col items-center text-center gap-8">
        <div className="jojo__logo--pulse">
          <InlineLogo size={140} />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
          <span className="text-jojo-magenta">Bizarre</span> meets{' '}
          <span className="text-jojo-pink">Beautiful.</span>
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-gray-700">
          Dive into the world of JoJo's Bizarre Adventure. Browse every anime season
          and manga part, discover legendary Stand users, and curate your personal
          collection of favorites.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/explore"
            className="px-7 py-3 rounded-full bg-jojo-pink text-white font-bold shadow-lg hover:bg-jojo-magenta hover:scale-105 transition-all duration-200"
          >
            Start Exploring
          </Link>
          <Link
            to="/favorites"
            className="px-7 py-3 rounded-full bg-white text-jojo-magenta font-bold border-2 border-jojo-magenta hover:bg-jojo-magenta hover:text-white transition-colors duration-200"
          >
            My Favorites
          </Link>
        </div>

      </div>
    </section>
  )
}
