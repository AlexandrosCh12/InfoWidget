/**
 * Clickable feed row: icon, accent strip, title, subtitle, timestamp. Used in compact and expanded lists.
 * Selecting a card calls `selectItem` so ExpandedView swaps to `DetailPanel`.
 */
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Bitcoin,
  Landmark,
  Cpu,
  type LucideIcon,
} from 'lucide-react'
import type { FeedItem } from '../store/widgetStore'
import { useWidgetStore } from '../store/widgetStore'
import { tokens } from '../theme/tokens'

// Same string keys as `adaptArticle` icon names → Lucide components for the card thumbnail.
const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  Bitcoin,
  Landmark,
  Cpu,
}

// Semantic accent → CSS token for icon and left rail color.
const accentColors: Record<string, string> = {
  blue: tokens.colors.accentBlue,
  green: tokens.colors.accentGreen,
  red: tokens.colors.accentRed,
  amber: tokens.colors.accentAmber,
}

const accentGlows: Record<string, string> = {
  blue: 'rgba(75, 141, 248, 0.10)',
  green: 'rgba(46, 219, 168, 0.10)',
  red: 'rgba(240, 82, 82, 0.10)',
  amber: 'rgba(247, 169, 40, 0.10)',
}

// Slightly stronger glow on hover per accent (pairs with compact vs full padding below).
const accentGlowsHover: Record<string, string> = {
  blue: `0 0 20px rgba(75, 141, 248, 0.08)`,
  green: `0 0 20px rgba(46, 219, 168, 0.08)`,
  red: `0 0 20px rgba(240, 82, 82, 0.08)`,
  amber: `0 0 20px rgba(247, 169, 40, 0.08)`,
}

interface FeedCardProps {
  item: FeedItem
  compact?: boolean
}

// `compact` tightens padding, icon box, and font sizes for the small strip; full mode is roomier for expanded feed.
export function FeedCard({ item, compact = false }: FeedCardProps) {
  const selectItem = useWidgetStore((s) => s.selectItem)
  const Icon = iconMap[item.icon] || TrendingUp
  const color = accentColors[item.accent]
  const glow = accentGlows[item.accent]
  const hoverGlow = accentGlowsHover[item.accent]

  return (
    <motion.button
      onClick={() => selectItem(item)}
      className="w-full text-left cursor-pointer"
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: { scale: 1, y: 0 },
        hover: {
          scale: 1.012,
          y: -0.5,
          transition: { duration: 0.15, ease: [0.22, 0.68, 0, 1] },
        },
        tap: {
          scale: 0.985,
          transition: { duration: 0.08 },
        },
      }}
    >
      <motion.div
        className="relative overflow-hidden"
        style={{
          padding: compact ? '7px 10px' : '9px 12px',
          borderRadius: tokens.radius.md,
          background: tokens.colors.bgGlassSubtle,
          border: `1px solid ${tokens.colors.borderSubtle}`,
        }}
        variants={{
          rest: {
            boxShadow: tokens.shadow.card,
            borderColor: tokens.colors.borderSubtle,
          },
          hover: {
            boxShadow: `${tokens.shadow.cardHover}, ${hoverGlow}`,
            borderColor: tokens.colors.borderHover,
            background: tokens.colors.bgGlassSubtleHover,
          },
        }}
      >
        {/* Accent line */}
        <div
          className="absolute left-0 top-2.5 bottom-2.5 w-[1.5px] rounded-full"
          style={{ background: color, opacity: 0.5 }}
        />

        <div className="flex items-start gap-2.5 pl-2">
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: compact ? 24 : 28,
              height: compact ? 24 : 28,
              borderRadius: tokens.radius.sm + 1,
              background: glow,
              marginTop: 1,
            }}
          >
            <Icon size={compact ? 11 : 13} style={{ color }} strokeWidth={1.8} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3
                className="font-semibold truncate"
                style={{
                  fontSize: compact ? 11 : 11.5,
                  lineHeight: 1.35,
                  color: tokens.colors.textPrimary,
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </h3>
              <span
                className="flex-shrink-0 tabular-nums"
                style={{
                  fontSize: 9,
                  fontWeight: 400,
                  color: tokens.colors.textMuted,
                  letterSpacing: '0.01em',
                }}
              >
                {item.timestamp}
              </span>
            </div>
            <p
              className="truncate"
              style={{
                fontSize: compact ? 10 : 10.5,
                color: tokens.colors.textSecondary,
                lineHeight: 1.35,
                marginTop: 2,
              }}
            >
              {item.subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.button>
  )
}
