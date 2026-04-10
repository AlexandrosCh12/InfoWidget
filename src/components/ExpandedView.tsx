/**
 * Full "expanded" shell: side controls, feed list or detail panel, and optional source overlay.
 * Wires live data (`useNews`) through interest filtering (`filterAndRankArticles`) and global selection (`useWidgetStore`).
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { useNews } from '../hooks/useNews'
import { filterAndRankArticles } from '../utils/filterArticles'
import { useWidgetStore, type FeedItem } from '../store/widgetStore'
import { FeedCard } from './FeedCard'
import { SideControlBar } from './SideControlBar'
import { StatusIndicator } from './StatusIndicator'
import { DetailPanel } from './DetailPanel'
import { SourceOverlay } from './SourceOverlay'
import { staggerContainer, staggerItem } from '../animations/variants'
import { tokens } from '../theme/tokens'

/** Matches `adaptArticle` output from `useNews` (NewsAPI → FeedCard fields). */
type AdaptedNewsItem = {
  id: string
  title: string
  subtitle: string
}

export function ExpandedView() {
  // Store: which card is opened, notification badge, Escape/back, overlay for video/chart.
  const selectedItem = useWidgetStore((s) => s.selectedItem)
  const notifications = useWidgetStore((s) => s.settings.notifications)
  const goBack = useWidgetStore((s) => s.goBack)
  const sourceOverlay = useWidgetStore((s) => s.sourceOverlay)
  const interests = useWidgetStore((s) => s.settings.interests)
  // Data: `useNews` fetches + adapts API articles; `filterAndRankArticles` applies user interests from settings.
  const activityLevel = useWidgetStore((s) => s.onboarding.activityLevel)

  // Quiet → 10 min, Important Updates Only → 5 min, Active/Real-Time → 1 min
  const pollIntervalMs =
    activityLevel === 'Active / Real-Time' ? 60_000
    : activityLevel === 'Quiet' ? 600_000
    : 300_000

  const { articles: rawArticles, loading, error } = useNews(pollIntervalMs)
  const articles = useMemo(
    () => filterAndRankArticles(rawArticles, interests),
    [rawArticles, interests],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (sourceOverlay) return
      e.preventDefault()
      goBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goBack, sourceOverlay])

  return (
    <div className="relative flex h-full min-h-0">
      <div
        className="flex flex-col items-center justify-between py-3"
        style={{
          width: 38,
          borderRight: `1px solid ${tokens.colors.borderDivider}`,
          background: 'transparent',
        }}
      >
        <SideControlBar orientation="vertical" />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className="flex shrink-0 items-center justify-between px-4 py-2.5"
          style={{ borderBottom: `1px solid ${tokens.colors.borderDivider}` }}
        >
          <div className="flex items-center gap-2">
            <h1
              style={{
                fontSize: 13,
                fontWeight: 650,
                color: tokens.colors.textPrimary,
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}
            >
              InfoWidget
            </h1>
            <StatusIndicator live={notifications} label={notifications ? 'Live' : 'Quiet'} />
          </div>
          <span
            className="tabular-nums"
            style={{
              fontSize: 9,
              fontWeight: 400,
              color: tokens.colors.textMuted,
              letterSpacing: '0.02em',
            }}
          >
            {articles.length} items
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={`detail-${selectedItem.id}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: [...tokens.animation.easeOutExpo] }}
              >
                <DetailPanel item={selectedItem} />
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                className="flex flex-col gap-1.5"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {loading ? (
                  <div style={{ fontSize: 11, color: tokens.colors.textMuted }}>Loading news…</div>
                ) : error ? (
                  <div style={{ fontSize: 11, color: tokens.colors.textMuted }}>
                    Unable to load news. Will retry shortly.
                  </div>
                ) : (
                  <>
                    <motion.p
                      variants={staggerItem}
                      style={{
                        fontSize: 9.5,
                        color: tokens.colors.textMuted,
                        fontWeight: 500,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase' as const,
                        marginBottom: 4,
                      }}
                    >
                      Latest Updates
                    </motion.p>
                    {articles.map((item: AdaptedNewsItem) => (
                      <motion.div key={item.id} variants={staggerItem}>
                        <FeedCard item={item as FeedItem} />
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SourceOverlay />
    </div>
  )
}
