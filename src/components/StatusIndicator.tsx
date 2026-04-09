import { motion } from 'framer-motion'
import { tokens } from '../theme/tokens'

interface StatusIndicatorProps {
  live?: boolean
  label?: string
}

export function StatusIndicator({ live = true, label = 'Live' }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        {live && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              background: tokens.colors.statusLive,
            }}
            animate={{
              opacity: [0.35, 0, 0],
              scale: [1, 2.2, 2.2],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
        <div
          className="relative rounded-full"
          style={{
            width: 5,
            height: 5,
            background: live ? tokens.colors.statusLive : tokens.colors.textMuted,
            boxShadow: live ? `0 0 6px ${tokens.colors.statusLiveGlow}` : 'none',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
          color: live ? tokens.colors.statusLive : tokens.colors.textMuted,
          opacity: 0.85,
        }}
      >
        {label}
      </span>
    </div>
  )
}
