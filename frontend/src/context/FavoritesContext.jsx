import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

const FavoritesContext = createContext(null)
const STORAGE_KEY = 'jojos:favorites:v1'

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      /* ignore */
    }
  }, [favorites])

  const isFavorite = useCallback(
    (kind, id) => Boolean(favorites[`${kind}:${id}`]),
    [favorites]
  )

  const toggleFavorite = useCallback((item) => {
    const key = `${item.kind}:${item.id}`
    setFavorites((prev) => {
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = {
          key,
          kind: item.kind,
          id: item.id,
          title: item.title ?? '',
          image: item.image ?? null,
          shortDescription: item.shortDescription ?? null,
        }
      }
      return next
    })
  }, [])

  const removeFavorite = useCallback((kind, id) => {
    const key = `${kind}:${id}`
    setFavorites((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      favorites,
      list: Object.values(favorites),
      isFavorite,
      toggleFavorite,
      removeFavorite,
    }),
    [favorites, isFavorite, toggleFavorite, removeFavorite]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
