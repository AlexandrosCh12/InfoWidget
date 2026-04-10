/**
 * React hooks let function components own state and side effects (fetch, timers, subscriptions).
 * `useNews` loads live headlines once on mount, keeps loading/error state, and maps articles
 * through `adaptArticle` so the rest of the app receives a consistent feed shape.
 *
 * @param intervalMs - How often to re-fetch headlines. Defaults to 5 minutes.
 *   Pass a shorter interval for Active/Real-Time mode, a longer one for Quiet mode.
 */
import { useState, useEffect } from 'react'
import type { FeedItem } from '../store/widgetStore'
import { fetchTopHeadlines, adaptArticle } from '../services/newsService'

interface UseNewsResult {
  articles: FeedItem[]
  loading: boolean
  error: string | null
}

export function useNews(intervalMs = 300_000): UseNewsResult {
  const [articles, setArticles] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mount: initial fetch; unmount or fast refresh: `cancelled` prevents setState after teardown.
  // Cleanup clears the refresh timer so we do not leak intervals or update an unmounted tree.
  // Re-runs whenever `intervalMs` changes (e.g. user switches activity level in settings).
  useEffect(() => {
    let cancelled = false

    async function loadNews() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchTopHeadlines()
        if (!cancelled) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setArticles(data.map((a: any, i: number) => adaptArticle(a, i) as FeedItem))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load news')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadNews()
    const interval = setInterval(loadNews, intervalMs)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [intervalMs])

  return { articles, loading, error }
}
