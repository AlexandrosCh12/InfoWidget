import { openUrl } from '@tauri-apps/plugin-opener'

/**
 * Opens an https URL in the system default browser (Tauri) or a new tab (web dev).
 * Non-HTTPS and malformed URLs are rejected to prevent opening dangerous protocols
 * such as `javascript:` or `file://`.
 */
export async function openExternalUrl(url: string): Promise<void> {
  const trimmed = url.trim()
  if (!trimmed) return

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    console.warn('openExternalUrl: invalid URL rejected:', trimmed)
    return
  }

  if (parsed.protocol !== 'https:') {
    console.warn('openExternalUrl: non-HTTPS URL rejected:', trimmed)
    return
  }

  try {
    await openUrl(trimmed)
  } catch {
    const w = window.open(trimmed, '_blank', 'noopener,noreferrer')
    w?.focus()
  }
}
