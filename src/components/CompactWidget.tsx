/**
 * Compact shell: always-visible strip with a few headline cards and a control rail.
 * Shows a subset of the same live feed as ExpandedView so users can skim without opening the full view.
 */
import { motion } from 'framer-motion'
import { getCompactCardCount } from '../data/feedData'
// @ts-ignore
import { useNews } from '../hooks/useNews'
import { filterAndRankArticles } from '../utils/filterArticles'
import { FeedCard } from './FeedCard'
import { SideControlBar } from './SideControlBar'
import { StatusIndicator } from './StatusIndicator'
import { staggerContainer, staggerItem } from '../animations/variants'
import { tokens } from '../theme/tokens'
import { useWidgetStore, type FeedItem } from '../store/widgetStore'

/** Matches `adaptArticle` output from `useNews` (NewsAPI → FeedCard fields). */
type AdaptedNewsItem = {
  id: string
  title: string
  subtitle: string
}

export function CompactWidget() {
  const activityLevel = useWidgetStore((s) => s.onboarding.activityLevel)
  const widgetSize = useWidgetStore((s) => s.settings.widgetSize)
  const notifications = useWidgetStore((s) => s.settings.notifications)
  const expandToFeed = useWidgetStore((s) => s.expandToFeed)
  const interests = useWidgetStore((s) => s.settings.interests)
  const { articles: rawArticles, loading, error } = useNews()
  const articles = filterAndRankArticles(rawArticles, interests)
  const count = getCompactCardCount(activityLevel, widgetSize)
  // Only the first N ranked articles appear; N depends on quiet/active mode and widget size.
  const visibleItems = articles.slice(0, count)
  const remaining = Math.max(0, articles.length - visibleItems.length)

  return (
    <div className="flex h-full min-h-0">
      <div
        className="flex flex-col items-center justify-between py-3"
        style={{
          width: 36,
          borderRight: `1px solid ${tokens.colors.borderDivider}`,
          background: 'transparent',
        }}
      >
        <SideControlBar orientation="vertical" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-3 pt-3 pb-2.5">
        <motion.div
          className="mb-2.5 flex items-center justify-between"
          variants={staggerItem}
        >
          <div className="flex items-center gap-2">
            <h1
              style={{
                fontSize: 12.5,
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
        </motion.div>

        <motion.div
          className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <div>Loading news…</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            visibleItems.map((item: AdaptedNewsItem) => (
              <motion.div key={item.id} variants={staggerItem}>
                <FeedCard item={item as FeedItem} compact />
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div className="mt-2 text-center" variants={staggerItem}>
          {remaining > 0 ? (
            <motion.button
              type="button"
              className="cursor-pointer"
              onClick={() => expandToFeed()}
              whileHover={{ opacity: 1 }}
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: tokens.colors.textMuted,
                letterSpacing: '0.04em',
              }}
            >
              {remaining} more — tap to expand
            </motion.button>
          ) : (
            <motion.button
              type="button"
              className="cursor-pointer"
              onClick={() => expandToFeed()}
              whileHover={{ opacity: 1 }}
              style={{
                fontSize: 9,
                fontWeight: 400,
                color: tokens.colors.textGhost,
                letterSpacing: '0.04em',
              }}
            >
              Open full feed
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
