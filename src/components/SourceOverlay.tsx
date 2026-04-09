import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { useWidgetStore } from '../store/widgetStore'
import { CHART_SOURCE_CONFIG } from '../data/chartSources'
import { tokens } from '../theme/tokens'

export function SourceOverlay() {
  const overlay = useWidgetStore((s) => s.sourceOverlay)
  const close = useWidgetStore((s) => s.closeSourceOverlay)
  const gridId = useId().replace(/:/g, '')

  useEffect(() => {
    if (!overlay) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlay, close])

  return (
    <AnimatePresence>
      {overlay ? (
        <motion.div
          className="absolute inset-0 z-[100] flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [...tokens.animation.easeOutExpo] }}
        >
          <button
            type="button"
            aria-label="Close source panel"
            className="absolute inset-0 cursor-pointer"
            style={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(6px)' }}
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative mx-2 mb-2 overflow-hidden flex flex-col"
            style={{
              maxHeight: overlay.kind === 'video' ? '78%' : '72%',
              borderRadius: tokens.radius.lg,
              border: `1px solid ${tokens.colors.borderSubtle}`,
              background: tokens.colors.bgGlassSubtle,
              boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
            }}
            initial={{ y: 28, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [...tokens.animation.easeOutExpo] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: `1px solid ${tokens.colors.borderDivider}` }}
            >
              <div className="min-w-0 pr-2">
                <p
                  className="truncate"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 650,
                    color: tokens.colors.textPrimary,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {overlay.kind === 'video' ? 'Coverage' : 'Live chart'}
                </p>
                <p
                  className="truncate"
                  style={{
                    fontSize: 9.5,
                    color: tokens.colors.textMuted,
                    marginTop: 2,
                  }}
                >
                  {overlay.title}
                </p>
              </div>
              <motion.button
                type="button"
                className="flex-shrink-0 cursor-pointer rounded-md p-1"
                style={{ color: tokens.colors.textMuted }}
                whileHover={{ scale: 1.06, color: tokens.colors.textPrimary }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.12 }}
                onClick={close}
                aria-label="Close"
              >
                <X size={14} strokeWidth={2} />
              </motion.button>
            </div>

            {overlay.kind === 'video' ? (
              <div className="relative w-full bg-black/40" style={{ aspectRatio: '16 / 9' }}>
                <iframe
                  title={overlay.title}
                  src={overlay.embedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="px-3 py-3">
                {overlay.subtitle ? (
                  <p
                    style={{
                      fontSize: 10,
                      color: tokens.colors.textSecondary,
                      marginBottom: 10,
                      lineHeight: 1.45,
                    }}
                  >
                    {overlay.subtitle}
                  </p>
                ) : null}
                <div
                  className="relative overflow-hidden"
                  style={{
                    height: 140,
                    borderRadius: tokens.radius.md,
                    border: `1px solid ${tokens.colors.borderSubtle}`,
                    background:
                      'linear-gradient(165deg, rgba(75, 141, 248, 0.06), rgba(46, 219, 168, 0.04))',
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.07]">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern
                          id={`grid-${gridId}`}
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#grid-${gridId})`} />
                    </svg>
                  </div>
                  {(() => {
                    const cfg = CHART_SOURCE_CONFIG[overlay.chartKey]
                    if (!cfg) {
                      return (
                        <div
                          className="absolute inset-0 flex items-center justify-center px-4 text-center"
                          style={{ fontSize: 10, color: tokens.colors.textMuted }}
                        >
                          Unknown chart key: {overlay.chartKey}
                        </div>
                      )
                    }
                    return (
                      <>
                        <svg
                          className="absolute inset-0 h-full w-full"
                          viewBox="0 0 200 72"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id={`chartFill-${gridId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={cfg.fillStops[0]} />
                              <stop offset="100%" stopColor={cfg.fillStops[1]} />
                            </linearGradient>
                          </defs>
                          <motion.path
                            d={cfg.areaPath}
                            fill={`url(#chartFill-${gridId})`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.45 }}
                          />
                          <motion.path
                            d={cfg.linePath}
                            fill="none"
                            stroke={cfg.lineColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.1, ease: 'easeOut' }}
                          />
                        </svg>
                        <div
                          className="absolute bottom-2 left-3 right-3 flex justify-between items-end"
                          style={{ pointerEvents: 'none' }}
                        >
                          <span style={{ fontSize: 8.5, color: tokens.colors.textMuted }}>
                            {cfg.caption}
                          </span>
                          <span
                            className="tabular-nums"
                            style={{ fontSize: 9, color: tokens.colors.accentGreen, fontWeight: 600 }}
                          >
                            +1.2%
                          </span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
