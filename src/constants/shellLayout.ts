import type { ViewMode } from '../store/widgetStore'

export const COMPACT_SIZES = {
  small: { width: 240, height: 250 },
  medium: { width: 260, height: 280 },
  large: { width: 300, height: 320 },
} as const

/** Logical window sizes per app screen (must match AppShell). */
export const VIEW_SIZES: Record<ViewMode, { width: number; height: number }> = {
  onboarding: { width: 420, height: 430 },
  compact: COMPACT_SIZES.medium,
  expanded: { width: 460, height: 540 },
  settings: { width: 360, height: 480 },
}

export function resolveCompactWindowSize(
  widgetSize: keyof typeof COMPACT_SIZES,
): { width: number; height: number } {
  return COMPACT_SIZES[widgetSize]
}

export function resolveWindowSize(
  viewMode: ViewMode,
  widgetSize: keyof typeof COMPACT_SIZES,
): { width: number; height: number } {
  if (viewMode === 'compact') return COMPACT_SIZES[widgetSize]
  return VIEW_SIZES[viewMode]
}
