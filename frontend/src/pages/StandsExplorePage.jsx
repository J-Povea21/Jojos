import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetch from '../hooks/useFetch.js'
import StandCard from '../components/StandCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SearchBar from '../components/SearchBar.jsx'

const PART_FILTERS = [
  { slug: 'all', label: 'All' },
  { slug: 'part-3', label: 'Part 3' },
  { slug: 'part-4', label: 'Part 4' },
  { slug: 'part-5', label: 'Part 5' },
  { slug: 'part-6', label: 'Part 6' },
  { slug: 'part-7', label: 'Part 7' },
  { slug: 'part-8', label: 'Part 8' },
  { slug: 'part-9', label: 'Part 9' },
  { slug: 'spin-offs', label: 'Spin-Offs' },
]

export default function StandsExplorePage() {
  const navigate = useNavigate()
  const [part, setPart] = useState('all')
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250)
    return () => clearTimeout(id)
  }, [query])

  const path = useMemo(() => {
    const params = new URLSearchParams()
    if (debounced) params.set('q', debounced)
    if (part && part !== 'all') params.set('part', part)
    const qs = params.toString()
    return qs ? `/api/stands?${qs}` : '/api/stands'
  }, [debounced, part])

  const { data, loading, error, reload } = useFetch(path)
  const stands = Array.isArray(data) ? data : []

  function handleKindChange(nextKind) {
    if (nextKind === 'stands') return
    navigate('/explore', { state: { kind: nextKind } })
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-jojo-magenta">
          Explore
        </h1>
        <p className="text-gray-600 text-sm">
          Every Stand from Part 3 to Part 9 plus spin-offs. Filter by part or search by name / user.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div role="tablist" aria-label="Content type" className="inline-flex rounded-full border border-jojo-gray bg-white p-1 self-start">
            {['anime', 'manga', 'stands'].map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={k === 'stands'}
                aria-controls="stands-panel"
                onClick={() => handleKindChange(k)}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                  k === 'stands'
                    ? 'bg-jojo-pink text-white'
                    : 'text-gray-700 hover:text-jojo-magenta'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Search stand or user..." />
        </div>

        <div role="tablist" aria-label="Filter by part" className="flex flex-wrap gap-2">
          {PART_FILTERS.map((p) => {
            const active = part === p.slug
            return (
              <button
                key={p.slug}
                role="tab"
                aria-selected={active}
                aria-controls="stands-panel"
                onClick={() => setPart(p.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-jojo-pink text-white border border-jojo-pink'
                    : 'bg-white border border-jojo-gray text-gray-600 hover:border-jojo-pink'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </header>

      <div id="stands-panel" role="tabpanel" aria-label="Stands results">
        {loading && <LoadingSpinner label="Loading stands... (first request scrapes live, can take a moment)" />}
        {error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {stands.length} stand{stands.length === 1 ? '' : 's'}
              {part !== 'all' ? ` in ${PART_FILTERS.find((p) => p.slug === part)?.label}` : ''}
              {debounced ? ` matching "${debounced}"` : ''}
            </p>
            {stands.length === 0 ? (
              <EmptyState
                title="No stands found"
                message={
                  debounced
                    ? `No stands match "${debounced}".`
                    : 'No stands available for this filter.'
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {stands.map((stand) => (
                  <StandCard key={stand.id} stand={stand} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
