/**
 * Detail view for a single feed item: header, body, "Why This Matters" (AI-generated via Groq),
 * and source actions. Shown inside ExpandedView when `selectedItem` is set.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Bitcoin,
  Landmark,
  Cpu,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react'
import type { FeedItem } from '../store/widgetStore'
import { useWidgetStore } from '../store/widgetStore'
import { SourcePanel } from './SourcePanel'
import { staggerContainer, staggerItem } from '../animations/variants'
import { tokens } from '../theme/tokens'
import { generateWhyItMatters } from '../services/groqService'

// String icon names from `adaptArticle` → actual Lucide components for rendering.
const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  Bitcoin,
  Landmark,
  Cpu,
}

// Maps semantic accent keys to theme token colors for icons and badges.
const accentColors: Record<string, string> = {
  blue: tokens.colors.accentBlue,
  green: tokens.colors.accentGreen,
  red: tokens.colors.accentRed,
  amber: tokens.colors.accentAmber,
}

const accentGlows: Record<string, string> = {
  blue: 'rgba(75, 141, 248, 0.12)',
  green: 'rgba(46, 219, 168, 0.12)',
  red: 'rgba(240, 82, 82, 0.12)',
  amber: 'rgba(247, 169, 40, 0.12)',
}

interface DetailPanelProps {
  item: FeedItem
}

export function DetailPanel({ item }: DetailPanelProps) {
  const goBack = useWidgetStore((s) => s.goBack)
  const [aiInsight, setAiInsight] = useState<string>('Generating insight...')
  const [insightLoading, setInsightLoading] = useState(true)

  // Lazy-load AI copy only when this item is open: avoids Groq calls for every headline in the list.
  // On item change (`item.id`), reset placeholder then replace with API text or `item.whyItMatters` on failure.
  useEffect(() => {
    setAiInsight('Generating insight...')
    setInsightLoading(true)

    generateWhyItMatters(item.title, item.subtitle, item.sourceLabel)
      .then((insight) => {
        setAiInsight(insight)
        setInsightLoading(false)
      })
      .catch(() => {
        setAiInsight(item.whyItMatters)
        setInsightLoading(false)
      })
  }, [item.id])

  const Icon = iconMap[item.icon] || TrendingUp
  const color = accentColors[item.accent]
  const glow = accentGlows[item.accent]

  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.button
        type="button"
        className="group mb-3 flex cursor-pointer items-center gap-1.5"
        onClick={goBack}
        variants={staggerItem}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.12, ease: [...tokens.animation.easeOutExpo] }}
        style={{ color: tokens.colors.textMuted }}
      >
        <ArrowLeft size={11} strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.01em' }}>Back</span>
      </motion.button>

      <motion.div className="mb-3 flex items-start gap-3" variants={staggerItem}>
        <div
          className="flex flex-shrink-0 items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: tokens.radius.md,
            background: glow,
          }}
        >
          <Icon size={16} style={{ color }} strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 font-medium uppercase"
              style={{
                fontSize: 8,
                background: glow,
                color,
                letterSpacing: '0.08em',
                borderRadius: tokens.radius.xs,
              }}
            >
              {item.type}
            </span>
            <span
              className="tabular-nums"
              style={{ fontSize: 9, color: tokens.colors.textMuted }}
            >
              {item.timestamp}
            </span>
          </div>
          <h2
            style={{
              fontSize: 14.5,
              fontWeight: 650,
              color: tokens.colors.textPrimary,
              lineHeight: 1.3,
              letterSpacing: '-0.015em',
              marginTop: 4,
            }}
          >
            {item.title}
          </h2>
          <p
            style={{
              fontSize: 10.5,
              color: tokens.colors.textSecondary,
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            {item.subtitle}
          </p>
        </div>
      </motion.div>

      <motion.p
        variants={staggerItem}
        style={{
          fontSize: 11,
          lineHeight: 1.65,
          color: tokens.colors.textSecondary,
          marginBottom: 12,
          fontWeight: 400,
        }}
      >
        {item.detail}
      </motion.p>

      <motion.div
        variants={staggerItem}
        className="mb-3"
        style={{
          padding: '8px 10px',
          borderRadius: tokens.radius.sm + 2,
          background: tokens.colors.accentBlueSoft,
          border: `1px solid rgba(75, 141, 248, 0.08)`,
        }}
      >
        <div className="mb-1.5 flex items-center gap-1.5">
          <div
            className="rounded-full"
            style={{
              width: 3.5,
              height: 3.5,
              background: tokens.colors.accentBlue,
              boxShadow: `0 0 4px ${tokens.colors.accentBlueGlow}`,
            }}
          />
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 600,
              color: tokens.colors.accentBlue,
              letterSpacing: '0.07em',
              textTransform: 'uppercase' as const,
            }}
          >
            Why This Matters
          </span>
        </div>
        <p
          style={{
            fontSize: 10,
            lineHeight: 1.6,
            color: tokens.colors.textMuted,
            fontWeight: 400,
          }}
        >
          {insightLoading ? 'Generating insight...' : aiInsight}
        </p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <SourcePanel item={item} />
      </motion.div>
    </motion.div>
  )
}
