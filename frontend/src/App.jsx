import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './components/Navbar.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import StandsExplorePage from './pages/StandsExplorePage.jsx'
import AnimeDetailPage from './pages/AnimeDetailPage.jsx'
import MangaDetailPage from './pages/MangaDetailPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/explore/stands" element={<StandsExplorePage />} />
            <Route path="/explore/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/explore/manga/:id" element={<MangaDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <footer className="border-t border-jojo-gray py-6 text-center text-sm text-gray-500">
        <p>Built for educational purposes. JoJo's Bizarre Adventure (c) Hirohiko Araki / Shueisha.</p>
      </footer>
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
