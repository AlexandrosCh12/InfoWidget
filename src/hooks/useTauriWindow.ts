import { useCallback } from 'react'
import type { ViewMode } from '../store/widgetStore'
import { COMPACT_SIZES, resolveWindowSize } from '../constants/shellLayout'

export function useTauriWindow() {
  const resizeWindow = useCallback(
    async (mode: ViewMode, compactSize: keyof typeof COMPACT_SIZES = 'medium') => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        const size = resolveWindowSize(mode, compactSize)
        const { LogicalSize } = await import('@tauri-apps/api/dpi')
        await win.setSize(new LogicalSize(size.width, size.height))
      } catch {
        // Running in browser dev mode — ignore
      }
    },
    [],
  )

  const setWindowCorner = useCallback(
    async (
      corner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
      compactSize: keyof typeof COMPACT_SIZES = 'medium',
      mode: ViewMode = 'compact',
    ) => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const { LogicalPosition } = await import('@tauri-apps/api/dpi')
        const win = getCurrentWindow()
        const tauriWin = win as unknown as {
          currentMonitor?: () => Promise<{
            size: { width: number; height: number }
            position: { x: number; y: number }
            scaleFactor: number
          } | null>
        }
        const monitor =
          typeof tauriWin.currentMonitor === 'function'
            ? await tauriWin.currentMonitor()
            : null
        if (!monitor) return

        const size = resolveWindowSize(mode, compactSize)
        const scaleFactor = monitor.scaleFactor
        const monitorWidth = monitor.size.width / scaleFactor
        const monitorHeight = monitor.size.height / scaleFactor
        const monitorLeft = monitor.position.x / scaleFactor
        const monitorTop = monitor.position.y / scaleFactor
        const margin = 24

        const isRight = corner.includes('right')
        const isBottom = corner.includes('bottom')

        const x = isRight
          ? monitorLeft + monitorWidth - size.width - margin
          : monitorLeft + margin
        const y = isBottom
          ? monitorTop + monitorHeight - size.height - margin
          : monitorTop + margin

        await win.setPosition(new LogicalPosition(x, y))
      } catch {
        // Running in browser dev mode — ignore
      }
    },
    [],
  )

  const startDrag = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().startDragging()
    } catch {
      // Running in browser dev mode
    }
  }, [])

  return { resizeWindow, setWindowCorner, startDrag }
}
