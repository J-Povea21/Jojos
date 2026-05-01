import { useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useFavorites } from '../context/FavoritesContext.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'anime', label: 'Anime' },
  { id: 'manga', label: 'Manga' },
  { id: 'stand', label: 'Stands' },
]

export default function FavoritesPage() {
  const { list, removeFavorite } = useFavorites()
  const [tab, setTab] = useState('all')
  const modalRef = useRef(null)

  const visible = useMemo(() => {
    if (tab === 'all') return list
    return list.filter((f) => f.kind === tab)
  }, [list, tab])

  function askRemove(fav) {
    modalRef.current?.open({
      title: `Remove "${fav.title}"?`,
      description: 'This will remove the item from your favorites.',
      confirmLabel: 'Remove',
      onConfirm: () => {
        removeFavorite(fav.kind, fav.id)
        toast.success(`Removed "${fav.title}" from favorites`)
      },
    })
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-jojo-magenta mb-2">Your Favorites</h1>
      <p className="text-sm text-gray-600 mb-6">
        Saved across sessions in your browser. {list.length} item{list.length === 1 ? '' : 's'} saved.
      </p>

      <div role="tablist" aria-label="Favorites filter" className="inline-flex rounded-full border border-jojo-gray bg-white p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="favorites-panel"
            onClick={() => setTab(t.id)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-jojo-pink text-white' : 'text-gray-700 hover:text-jojo-magenta'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="favorites-panel" role="tabpanel" aria-label={`${tab} favorites`}>
        {visible.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            message={
              tab === 'all'
                ? 'Start exploring and tap the heart on anything you love.'
                : `You haven't favorited any ${tab} yet.`
            }
            action={
              <Link
                to="/explore"
                className="inline-block mt-2 px-5 py-2 rounded-full bg-jojo-pink text-white font-semibold hover:bg-jojo-magenta transition-colors"
              >
                Explore now
              </Link>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {visible.map((fav) => (
              <li
                key={fav.key}
                className="flex gap-3 p-3 bg-white border border-jojo-gray rounded-lg hover:border-jojo-pink transition-colors"
              >
                <div className="w-20 h-28 rounded-md bg-jojo-gray overflow-hidden shrink-0">
                  {fav.image ? (
                    <img src={fav.image} alt={fav.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-jojo-pink/40 to-jojo-blue/40" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-between">
                  <div>
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded-full bg-jojo-blue/40 text-jojo-magenta">
                      {fav.kind}
                    </span>
                    <Link
                      to={fav.kind === 'stand' ? '/explore/stands' : `/explore/${fav.kind}/${fav.id}`}
                      className="block mt-1 font-bold text-gray-900 hover:text-jojo-magenta truncate"
                    >
                      {fav.title}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => askRemove(fav)}
                    className="self-start text-xs px-2 py-1 rounded-md border border-jojo-gray text-gray-600 hover:bg-jojo-pink hover:text-white hover:border-jojo-pink transition-colors"
                    aria-label={`Remove ${fav.title} from favorites`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal ref={modalRef} />
    </section>
  )
}
