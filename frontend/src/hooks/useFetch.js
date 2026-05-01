import { useEffect, useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

export default function useFetch(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal })
        if (!res.ok) {
          let detail = ''
          try {
            const body = await res.json()
            detail = body?.error?.message || ''
          } catch {
            /* ignore */
          }
          throw new Error(detail || `Request failed (${res.status})`)
        }
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (err) {
        if (err.name === 'AbortError') return
        if (!cancelled) setError(err.message || 'Unexpected error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [path, reloadKey])

  return { data, loading, error, reload }
}

export { API_BASE }
