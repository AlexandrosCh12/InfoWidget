import { motion } from 'framer-motion'
import { useId } from 'react'
import { Play, ExternalLink, BarChart3, ChevronRight } from 'lucide-react'
import type { FeedItem } from '../store/widgetStore'
import { useWidgetStore } from '../store/widgetStore'
import { tokens } from '../theme/tokens'

interface SourcePanelProps {
  item: FeedItem
}

function sourceIsActionable(item: FeedItem): boolean {
  if (item.sourceScope === 'external') {
    return Boolean(item.sourceUrl?.trim())
  }
  return Boolean(item.sourceTarget?.trim())
}

export function SourcePanel({ item }: SourcePanelProps) {
  const activateItemSource = useWidgetStore((s) => s.activateItemSource)
  const gridPatternId = `src-grid-${useId().replace(/:/g, '')}`
  const actionable = sourceIsActionable(item)

  const icons = {
    article: ExternalLink,
    video: Play,
    chart: BarChart3,
  }
  const Icon = icons[item.sourceType]

  const labels = {
    article: 'Read Full Article',
    video: 'Watch Coverage',
    chart: 'View Live Chart',
  }

  const handleActivate = () => {
    if (!actionable) return
    activateItemSource(item)
  }

  return (
    <motion.div
      className="overflow-hidden"
      style={{
        borderRadius: tokens.radius.md,
        border: `1px solid ${tokens.colors.borderSubtle}`,
        background: tokens.colors.bgGlassSubtle,
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.25, ease: [...tokens.animation.easeOutExpo] }}
    >
      {/* Preview — full region opens source */}
      <motion.button
        type="button"
        disabled={!actionable}
        onClick={handleActivate}
        className="relative flex w-full items-center justify-center outline-none"
        style={{
          height: 72,
          cursor: actionable ? 'pointer' : 'not-allowed',
          opacity: actionable ? 1 : 0.65,
          background:
            'linear-gradient(135deg, rgba(75, 141, 248, 0.04), rgba(46, 219, 168, 0.03))',
        }}
        whileHover={
          actionable
            ? {
                background:
                  'linear-gradient(135deg, rgba(75, 141, 248, 0.08), rgba(46, 219, 168, 0.06))',
              }
            : undefined
        }
        whileTap={actionable ? { scale: 0.992 } : undefined}
        transition={{ duration: 0.14, ease: [...tokens.animation.easeOutExpo] }}
        aria-label={`${labels[item.sourceType]} from ${item.sourceLabel}`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id={gridPatternId}
                width="18"
                height="18"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 18 0 L 0 0 0 18"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
          </svg>
        </div>

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 200 72"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 0 55 Q 30 42 50 46 T 100 32 T 150 22 T 200 12"
            fill="none"
            stroke="rgba(46, 219, 168, 0.25)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.25 }}
          />
          <motion.path
            d="M 0 55 Q 30 42 50 46 T 100 32 T 150 22 T 200 12 L 200 72 L 0 72 Z"
            fill="url(#chartGradientSource)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          />
          <defs>
            <linearGradient id="chartGradientSource" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(46, 219, 168, 0.06)" />
              <stop offset="100%" stopColor="rgba(46, 219, 168, 0)" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 pointer-events-none"
          style={{
            borderRadius: 20,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            border: `1px solid rgba(255, 255, 255, 0.08)`,
          }}
        >
          <Icon size={11} style={{ color: 'rgba(255, 255, 255, 0.65)' }} strokeWidth={1.8} />
          <span
            style={{
              fontSize: 9.5,
              color: 'rgba(255, 255, 255, 0.65)',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          >
            {labels[item.sourceType]}
          </span>
        </motion.div>
      </motion.button>

      {/* Source attribution row */}
      <motion.button
        type="button"
        disabled={!actionable}
        onClick={handleActivate}
        className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left outline-none"
        style={{
          borderTop: `1px solid ${tokens.colors.borderDivider}`,
          cursor: actionable ? 'pointer' : 'not-allowed',
          opacity: actionable ? 1 : 0.65,
        }}
        whileHover={
          actionable
            ? { background: 'rgba(255, 255, 255, 0.03)' }
            : undefined
        }
        whileTap={actionable ? { scale: 0.995 } : undefined}
        transition={{ duration: 0.12, ease: [0.22, 0.68, 0, 1] }}
        aria-label={`Source: ${item.sourceLabel}. ${labels[item.sourceType]}`}
      >
        <span
          style={{
            fontSize: 9.5,
            color: tokens.colors.textMuted,
            fontWeight: 400,
            minWidth: 0,
          }}
        >
          <span style={{ color: tokens.colors.textGhost }}>Source · </span>
          <span style={{ color: tokens.colors.textSecondary }}>{item.sourceLabel}</span>
        </span>
        <span
          className="flex flex-shrink-0 items-center gap-0.5"
          style={{ color: tokens.colors.textMuted }}
        >
          <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.06em' }}>OPEN</span>
          <ChevronRight size={11} strokeWidth={2} />
        </span>
      </motion.button>
    </motion.div>
  )
}
