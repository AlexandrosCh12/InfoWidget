import { useCallback } from 'react'
import { useWidgetStore } from '../store/widgetStore'
import type { FeedItem } from '../store/widgetStore'

/**
 * Single entry point for app navigation actions (shell screens + feed/detail + source overlay).
 */
export function useAppNavigation() {
  const viewMode = useWidgetStore((s) => s.viewMode)
  const selectedItem = useWidgetStore((s) => s.selectedItem)
  const setViewMode = useWidgetStore((s) => s.setViewMode)
  const openSettings = useWidgetStore((s) => s.openSettings)
  const closeSettings = useWidgetStore((s) => s.closeSettings)
  const goBack = useWidgetStore((s) => s.goBack)
  const expandToFeed = useWidgetStore((s) => s.expandToFeed)
  const selectItem = useWidgetStore((s) => s.selectItem)
  const clearSelection = useWidgetStore((s) => s.clearSelection)
  const closeSourceOverlay = useWidgetStore((s) => s.closeSourceOverlay)
  const activateItemSource = useWidgetStore((s) => s.activateItemSource)

  const toggleExpanded = useCallback(() => {
    setViewMode(viewMode === 'expanded' ? 'compact' : 'expanded')
  }, [setViewMode, viewMode])

  const openDetail = useCallback(
    (item: FeedItem) => {
      selectItem(item)
    },
    [selectItem],
  )

  return {
    viewMode,
    selectedItem,
    setViewMode,
    toggleExpanded,
    openSettings,
    closeSettings,
    goBack,
    expandToFeed,
    openDetail,
    clearSelection,
    closeSourceOverlay,
    activateItemSource,
    canGoBack:
      viewMode === 'settings' || (viewMode === 'expanded' && selectedItem !== null),
  }
}
