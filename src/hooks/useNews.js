/**
 * React hooks let function components own state and side effects (fetch, timers, subscriptions).
 * `useNews` loads live headlines once on mount, keeps loading/error state, and maps articles
 * through `adaptArticle` so the rest of the app receives a consistent feed shape.
 */
import { useState, useEffect } from 'react';
import { fetchTopHeadlines, adaptArticle } from '../services/newsService';

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mount: initial fetch; unmount or fast refresh: `cancelled` prevents setState after teardown.
  // Cleanup clears the refresh timer so we do not leak intervals or update an unmounted tree.
  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTopHeadlines();
        if (!cancelled) {
          setArticles(data.map((a, i) => adaptArticle(a, i)));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNews();
    // Poll every 5 minutes so the compact widget and expanded feed stay reasonably fresh without hammering the API.
    const interval = setInterval(loadNews, 300_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { articles, loading, error };
}
