import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useFetch from '../hooks/useFetch.js'
import Card from '../components/Card.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function ExplorePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialKind = location.state?.kind === 'manga' ? 'manga' : 'anime'
  const [kind, setKind] = useState(initialKind)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250)
    return () => clearTimeout(id)
  }, [query])

  const path = `/api/${kind}`
  const { data, loading, error, reload } = useFetch(path)

  const filtered = useMemo(() => {
    if (!Array.isArray(data)) return []
    if (!debounced) return data
    const q = debounced.toLowerCase()
    return data.filter((item) => item.title?.toLowerCase().includes(q))
  }, [data, debounced])

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-jojo-magenta">
          Explore
        </h1>
        <p className="text-gray-600 text-sm">Browse every JoJo part. Toggle between anime and manga.</p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div role="tablist" aria-label="Content type" className="inline-flex rounded-full border border-jojo-gray bg-white p-1 self-start">
            {['anime', 'manga', 'stands'].map((k) => {
              const active = kind === k
              const handleClick = () => {
                if (k === 'stands') {
                  navigate('/explore/stands')
                } else {
                  setKind(k)
                }
              }
              const activeCls = 'bg-jojo-pink text-white'
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`explore-panel-${k}`}
                  onClick={handleClick}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                    active ? activeCls : 'text-gray-700 hover:text-jojo-magenta'
                  }`}
                >
                  {k}
                </button>
              )
            })}
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder={`Search ${kind}...`} />
        </div>
      </header>

      <div
        id={`explore-panel-${kind}`}
        role="tabpanel"
        aria-label={`${kind} results`}
      >
        {loading && <LoadingSpinner label={`Loading ${kind}... (first request scrapes live, can take a moment)`} />}
        {error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <EmptyState
                title="No results"
                message={debounced ? `No ${kind} matches "${debounced}".` : `No ${kind} available.`}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map((item) => (
                  <Card key={item.id} item={item} kind={kind} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
