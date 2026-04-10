/**
 * AI insight layer: proxies through the backend's /insight endpoint so the Groq
 * API key never lives in the client bundle. The backend handles auth and rate-limiting.
 */
import { fetch } from '@tauri-apps/plugin-http'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Returns a 2–3 sentence actionable insight for the headline, or a static fallback
 * if the backend is unavailable or times out.
 *
 * @param title - Article headline shown in the UI.
 * @param description - Subtitle / summary passed as context.
 * @param source - Publisher name for attribution in fallbacks.
 */
export async function generateWhyItMatters(
  title: string,
  description: string,
  source: string
): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(`${API_BASE_URL}/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, source }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Insight API error: ${response.status}`)
    }

    const data = await response.json()
    if (data?.insight) {
      return String(data.insight).trim()
    }

    return `Reported by ${source}. Tap the source link to read more.`
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('Insight API error:', error)
    return `Reported by ${source}. Tap the source link to read more.`
  }
}
