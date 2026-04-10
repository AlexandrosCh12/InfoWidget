/**
 * News API layer: all HTTP calls to the backend news proxy live here.
 * The UI never talks to third-party news APIs directly; this module fetches raw
 * articles, deduplicates them, and adapts them into the app's FeedItem-shaped objects.
 */
import { fetch } from '@tauri-apps/plugin-http';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Fetches top headlines from several categories in parallel and merges them into one list.
 *
 * @param {number} [pageSize=30] - Max articles requested per category from the server.
 * @returns {Promise<object[]>} Raw article objects from the API (title, url, publishedAt, etc.).
 * @throws If the network fails, the server errors, or no articles are returned after merge.
 */
export async function fetchTopHeadlines(pageSize = 30) {
  const categories = ['general', 'business', 'technology'];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);

  try {
    const results = await Promise.all(
      categories.map(async (cat) => {
        const url = `${API_BASE_URL}/news?category=${cat}&pageSize=${pageSize}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`[${cat}] Server responded with ${response.status}`);
        }
        return response.json();
      })
    );
    clearTimeout(timeoutId);

    const seen = new Set();
    const articles = [];
    for (const data of results) {
      if (data.status === 'ok' && data.articles) {
        for (const article of data.articles) {
          if (article.url && !seen.has(article.url)) {
            seen.add(article.url);
            articles.push(article);
          }
        }
      }
    }

    if (articles.length === 0) {
      throw new Error('No articles returned');
    }

    return articles;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to fetch news:', error);
    throw error;
  }
}

/**
 * Maps a single NewsAPI-style article into the shape the widget expects (ids, accents, copy).
 *
 * @param {object} article - Raw article from the backend (title, description, url, publishedAt, etc.).
 * @param {number} index - Fallback index for stable `id` when `url` is missing.
 * @returns {object} A feed-ready object with `accent`, `icon`, `detail`, `whyItMatters`, etc.
 */
export function adaptArticle(article, index) {
  // Accent & icon: no category field is trusted for styling, so we scan title + description.
  // Keyword buckets pick a theme color and a Lucide icon name (resolved in FeedCard / DetailPanel).
  // Crypto → amber + Bitcoin; markets → green + TrendingUp; tech → blue + Cpu; geopolitics → red + Landmark.
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase()

  let accent = 'blue'
  let icon = 'Landmark'

  if (/bitcoin|crypto|btc|eth|coin|token/.test(text)) {
    accent = 'amber'; icon = 'Bitcoin'
  } else if (/stock|market|s&p|nasdaq|dow|earnings|revenue|fed|rate|bond|trade/.test(text)) {
    accent = 'green'; icon = 'TrendingUp'
  } else if (/ai|tech|nvidia|software|chip|cyber|apple|google|microsoft|startup/.test(text)) {
    accent = 'blue'; icon = 'Cpu'
  } else if (/war|conflict|election|politics|government|law|court|sanction/.test(text)) {
    accent = 'red'; icon = 'Landmark'
  }

  // Relative time string for the card header (minutes / hours / days).
  let timestamp = 'Just now'
  if (article.publishedAt) {
    const diffMs = Date.now() - new Date(article.publishedAt).getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) timestamp = 'Just now'
    else if (diffMin < 60) timestamp = `${diffMin}m ago`
    else if (diffMin < 1440) timestamp = `${Math.floor(diffMin / 60)}h ago`
    else timestamp = `${Math.floor(diffMin / 1440)}d ago`
  }

  // Body copy: prefer `content` when present; NewsAPI appends a "[+N chars]" suffix when truncated.
  const detail =
    (article.content || article.description || 'No further details available.')
      .replace(/\[\+\d+ chars\]$/, '')  // strip NewsAPI's "[+N chars]" truncation marker
      .trim()

  // Placeholder insight until DetailPanel loads an AI summary; always mentions source for trust.
  const source = article.source?.name || 'Unknown source'
  const whyItMatters = `Reported by ${source}. Stay informed on how this story develops — tap the source link below to read the full article.`

  // FeedItem fields: id/url identity; type/source* for navigation; title/subtitle/detail for UI;
  // whyItMatters = fallback before Groq; accent/icon = visual theme; interestTags seeds personalization.
  return {
    id: article.url || String(index),
    type: 'news',
    title: article.title || 'No title',
    subtitle: article.description || source,
    detail,
    whyItMatters,
    sourceType: 'article',
    sourceLabel: source,
    sourceScope: 'external',
    sourceUrl: article.url || '',
    sourceTarget: undefined,
    timestamp,
    accent,
    icon,
    interestTags: ['World News'],
  }
}
