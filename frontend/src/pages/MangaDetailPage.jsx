import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useFetch from '../hooks/useFetch.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'

export default function MangaDetailPage() {
  const { id } = useParams()
  const { data, loading, error, reload } = useFetch(`/api/manga/${id}`)
  const [imgError, setImgError] = useState(false)
  useEffect(() => { setImgError(false) }, [id])

  if (loading) return <LoadingSpinner label="Loading manga details..." />
  if (error) return <ErrorMessage message={error} onRetry={reload} />
  if (!data) return null

  const showImage = data.image && !imgError

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-jojo-magenta hover:underline mb-4">
        <span aria-hidden="true">←</span> Back to Explore
      </Link>

      <article className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {data.author && (
              <>
                <dt className="font-semibold text-gray-700">Author</dt>
                <dd className="text-gray-600">{data.author}</dd>
              </>
            )}
            {data.originalRun && (
              <>
                <dt className="font-semibold text-gray-700">Original Run</dt>
                <dd className="text-gray-600">{data.originalRun}</dd>
              </>
            )}
            {data.volumes != null && (
              <>
                <dt className="font-semibold text-gray-700">Volumes</dt>
                <dd className="text-gray-600">{data.volumes}</dd>
              </>
            )}
            {data.chapters != null && (
              <>
                <dt className="font-semibold text-gray-700">Chapters</dt>
                <dd className="text-gray-600">{data.chapters}</dd>
              </>
            )}
            {data.status && (
              <>
                <dt className="font-semibold text-gray-700">Status</dt>
                <dd className="text-gray-600 capitalize">{data.status}</dd>
              </>
            )}
            {data.partNumber != null && (
              <>
                <dt className="font-semibold text-gray-700">Part</dt>
                <dd className="text-gray-600">{data.partNumber}</dd>
              </>
            )}
          </dl>
          {data.description && (
            <p className="text-gray-700 leading-relaxed">{data.description}</p>
          )}
          <div className="mt-2">
            <FavoriteButton
              size="lg"
              item={{ kind: 'manga', id: data.id, title: data.title, image: data.image, shortDescription: data.shortDescription }}
            />
          </div>
        </div>
      </article>
    </section>
  )
}
