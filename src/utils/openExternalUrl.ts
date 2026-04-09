import { openUrl } from '@tauri-apps/plugin-opener'

/**
 * Opens an https URL in the system default browser (Tauri) or a new tab (web dev).
 */
export async function openExternalUrl(url: string): Promise<void> {
  const trimmed = url.trim()
  if (!trimmed) return

  try {
    await openUrl(trimmed)
  } catch {
    const w = window.open(trimmed, '_blank', 'noopener,noreferrer')
    w?.focus()
  }
}
