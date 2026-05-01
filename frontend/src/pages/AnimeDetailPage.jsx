import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useFetch from '../hooks/useFetch.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import CharacterCard from '../components/CharacterCard.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'

export default function AnimeDetailPage() {
  const { id } = useParams()
  const { data, loading, error, reload } = useFetch(`/api/anime/${id}`)
  const [imgError, setImgError] = useState(false)
  useEffect(() => { setImgError(false) }, [id])

  if (loading) return <LoadingSpinner label="Loading anime details..." />
  if (error) return <ErrorMessage message={error} onRetry={reload} />
  if (!data) return null

  const showImage = data.image && !imgError

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-jojo-magenta hover:underline mb-4">
        <span aria-hidden="true">←</span> Back to Explore
      </Link>

      <article className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-jojo-gray">
            {showImage ? (
              <img
                src={data.image}
                alt={data.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-jojo-pink/30 via-jojo-blue/30 to-jojo-green/30 text-jojo-magenta font-bold p-4 text-center">
                {data.title}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-jojo-magenta leading-tight">{data.title}</h1>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {data.originalRun && (
              <>
                <dt className="font-semibold text-gray-700">Original Run</dt>
                <dd className="text-gray-600">{data.originalRun}</dd>
              </>
            )}
            {data.episodes != null && (
              <>
                <dt className="font-semibold text-gray-700">Episodes</dt>
                <dd className="text-gray-600">{data.episodes}</dd>
              </>
            )}
            {data.status && (
              <>
                <dt className="font-semibold text-gray-700">Status</dt>
                <dd className="text-gray-600 capitalize">{data.status}</dd>
              </>
            )}
            {data.seasonNumber != null && (
              <>
                <dt className="font-semibold text-gray-700">Season</dt>
                <dd className="text-gray-600">{data.seasonNumber}</dd>
              </>
            )}
          </dl>
          {data.shortDescription && (
            <p className="text-gray-700 leading-relaxed">{data.shortDescription}</p>
          )}
          {data.description && data.description !== data.shortDescription && (
            <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
          )}
          <div className="mt-2">
            <FavoriteButton
              size="lg"
              item={{ kind: 'anime', id: data.id, title: data.title, image: data.image, shortDescription: data.shortDescription }}
            />
          </div>
        </div>
      </article>

      {Array.isArray(data.mainCharacters) && data.mainCharacters.length > 0 && (
        <section aria-labelledby="characters-heading">
          <h2 id="characters-heading" className="text-2xl font-bold text-jojo-magenta mb-4">
            Main Characters
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.mainCharacters.map((c, idx) => (
              <CharacterCard key={`${c.name}-${idx}`} character={c} />
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
