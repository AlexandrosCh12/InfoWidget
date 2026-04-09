import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useWidgetStore } from '../store/widgetStore'
import { useTauriWindow } from '../hooks/useTauriWindow'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CompactWidget } from './CompactWidget'
import { ExpandedView } from './ExpandedView'
import { SettingsPanel } from './SettingsPanel'
import { OnboardingFlow } from './OnboardingFlow'
import { tokens } from '../theme/tokens'
import type { ViewMode } from '../store/widgetStore'
import {
  resolveShellTransition,
  type ShellTransition,
} from '../navigation/appNavigation'
import { COMPACT_SIZES, VIEW_SIZES } from '../constants/shellLayout'

const shellEase = tokens.animation.easeOutExpo

const shellTransitionVariants: Variants = {
  initial: (t: ShellTransition) => {
    if (t === 'toSettings') return { x: 22, opacity: 0, scale: 0.995 }
    if (t === 'fromSettings') return { x: -20, opacity: 0, scale: 0.995 }
    return { opacity: 0, scale: 0.98 }
  },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: tokens.animation.durationNormal,
      ease: shellEase,
    },
  },
  exit: (t: ShellTransition) => {
    if (t === 'toSettings')
      return {
        x: -18,
        opacity: 0,
        scale: 0.992,
        transition: { duration: 0.22, ease: shellEase },
      }
    if (t === 'fromSettings')
      return {
        x: 22,
        opacity: 0,
        scale: 0.992,
        transition: { duration: 0.22, ease: shellEase },
      }
    return {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.18, ease: shellEase },
    }
  },
}

function ViewContent({ mode }: { mode: ViewMode }) {
  switch (mode) {
    case 'onboarding':
      return <OnboardingFlow />
    case 'compact':
      return <CompactWidget />
    case 'expanded':
      return <ExpandedView />
    case 'settings':
      return <SettingsPanel />
  }
}

/**
 * Single desktop-widget shell: one rounded glass surface = window boundary.
 */
export function AppShell() {
  const viewMode = useWidgetStore((s) => s.viewMode)
  const settings = useWidgetStore((s) => s.settings)
  const { resizeWindow, setWindowCorner, startDrag } = useTauriWindow()

  const prevScreenRef = useRef<ViewMode>(viewMode)
  const shellTransition = resolveShellTransition(prevScreenRef.current, viewMode)
  useLayoutEffect(() => {
    prevScreenRef.current = viewMode
  }, [viewMode])

  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme =
    settings.theme === 'auto' ? (systemDark ? 'dark' : 'light') : settings.theme

  useEffect(() => {
    resizeWindow(viewMode, settings.widgetSize)
  }, [settings.widgetSize, viewMode, resizeWindow])

  useEffect(() => {
    setWindowCorner(settings.position, settings.widgetSize, viewMode)
  }, [settings.position, settings.widgetSize, viewMode, setWindowCorner])

  const size =
    viewMode === 'compact'
      ? COMPACT_SIZES[settings.widgetSize]
      : VIEW_SIZES[viewMode]

  const shellPositionStyle =
    viewMode === 'compact'
      ? settings.position.includes('top')
        ? { top: 0 }
        : { bottom: 0 }
      : { top: 0 }

  const shellRadius = 'var(--iw-shell-radius)'

  return (
    <motion.div
      className={`theme-${resolvedTheme} ${viewMode === 'compact' ? 'absolute z-20' : 'relative'} h-full min-h-0 w-full`}
      style={{
        ...shellPositionStyle,
        ...(viewMode === 'compact'
          ? settings.position.includes('right')
            ? { right: 0 }
            : { left: 0 }
          : {}),
        borderRadius: shellRadius,
        overflow: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        border: `1px solid ${tokens.colors.borderSubtle}`,
        boxShadow: tokens.shadow.shell,
        contain: 'paint',
      }}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        width: size.width,
        height: size.height,
      }}
      transition={{ ...tokens.animation.spring }}
    >
      {/* Blur and tint are split: a single node with both can composite a full-bleed plate behind rounded corners on some GPUs. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          zIndex: 0,
          WebkitBackdropFilter: `blur(${tokens.blur.glass}px)`,
          backdropFilter: `blur(${tokens.blur.glass}px)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(145deg, var(--iw-shell-grad-from), var(--iw-shell-grad-to))',
        }}
      />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[inherit]">
        <div
          className="absolute top-0 right-0 left-0 z-50 h-7 cursor-grab active:cursor-grabbing"
          onMouseDown={startDrag}
        />

        <div
          className="pointer-events-none absolute top-0 right-5 left-5 z-[2] h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          }}
        />

        <AnimatePresence mode="wait" custom={shellTransition}>
          <motion.div
            key={viewMode}
            className="flex min-h-0 flex-1 flex-col"
            custom={shellTransition}
            variants={shellTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ViewContent mode={viewMode} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
