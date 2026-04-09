/**
 * Settings overlay: interest chips, notifications toggle, widget size, theme, and screen position.
 * Persists through `useWidgetStore` (localStorage-backed for settings).
 */
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { useEffect } from 'react'
import { useWidgetStore } from '../store/widgetStore'
import { allInterests } from '../data/feedData'
import { staggerContainer, staggerItem } from '../animations/variants'
import { tokens } from '../theme/tokens'

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      className="relative cursor-pointer flex-shrink-0"
      aria-pressed={enabled}
      style={{
        width: 34,
        height: 19,
        borderRadius: 10,
        background: enabled ? 'rgba(46, 219, 168, 0.22)' : 'rgba(255, 255, 255, 0.06)',
        border: `1px solid ${enabled ? 'rgba(46, 219, 168, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
      }}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 13,
          height: 13,
          top: 2,
          background: enabled ? tokens.colors.accentGreen : 'rgba(255, 255, 255, 0.28)',
          boxShadow: enabled
            ? `0 0 6px ${tokens.colors.accentGreenGlow}`
            : '0 1px 2px rgba(0,0,0,0.3)',
        }}
        animate={{ left: enabled ? 17 : 2 }}
        transition={{ ...tokens.animation.springBouncy }}
      />
    </motion.button>
  )
}

function OptionPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      className="relative cursor-pointer px-3 py-1.5"
      aria-pressed={active}
      style={{
        borderRadius: tokens.radius.sm + 1,
        fontSize: 10,
        fontWeight: 500,
        color: active ? 'rgba(255, 255, 255, 0.88)' : tokens.colors.textMuted,
        background: active ? tokens.colors.accentBlueSoft : tokens.colors.bgGlassSubtle,
        border: `1px solid ${active ? 'rgba(75, 141, 248, 0.15)' : tokens.colors.borderSubtle}`,
        letterSpacing: '0.01em',
      }}
      whileHover={{
        background: active ? 'rgba(75, 141, 248, 0.12)' : tokens.colors.bgGlassSubtleHover,
        borderColor: active ? 'rgba(75, 141, 248, 0.2)' : tokens.colors.borderHover,
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12, ease: [0.22, 0.68, 0, 1] }}
      onClick={onClick}
    >
      {label}
    </motion.button>
  )
}

function InterestChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      className="relative flex items-center gap-1 cursor-pointer px-2 py-1"
      aria-pressed={active}
      style={{
        borderRadius: tokens.radius.sm,
        fontSize: 9,
        fontWeight: 500,
        color: active ? tokens.colors.accentGreen : tokens.colors.textMuted,
        background: active ? tokens.colors.accentGreenSoft : tokens.colors.bgGlassSubtle,
        border: `1px solid ${active ? 'rgba(46, 219, 168, 0.12)' : tokens.colors.borderSubtle}`,
        letterSpacing: '0.01em',
      }}
      whileHover={{
        borderColor: active ? 'rgba(46, 219, 168, 0.22)' : tokens.colors.borderHover,
        background: active ? 'rgba(46, 219, 168, 0.10)' : tokens.colors.bgGlassSubtleHover,
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.12, ease: [0.22, 0.68, 0, 1] }}
      onClick={onClick}
    >
      {active && <Check size={8} strokeWidth={2.5} />}
      {label}
    </motion.button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block mb-2"
      style={{
        fontSize: 9,
        fontWeight: 600,
        color: tokens.colors.textMuted,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  )
}

export function SettingsPanel() {
  const { settings, updateSettings, toggleInterest, goBack } = useWidgetStore()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goBack])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ borderBottom: `1px solid ${tokens.colors.borderDivider}` }}
      >
        <motion.button
          type="button"
          aria-label="Back to previous screen"
          className="flex items-center justify-center cursor-pointer rounded-md h-8 w-8 min-h-[32px] min-w-[32px] -ml-1.5 shrink-0 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(75,141,248,0.45)] focus-visible:ring-offset-0"
          onClick={goBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12, ease: [...tokens.animation.easeOutExpo] }}
          style={{ color: tokens.colors.textMuted }}
        >
          <ArrowLeft size={13} strokeWidth={2} aria-hidden />
        </motion.button>
        <h1
          style={{
            fontSize: 13,
            fontWeight: 650,
            color: tokens.colors.textPrimary,
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          Settings
        </h1>
      </div>

      {/* Settings content */}
      <motion.div
        className="flex-1 overflow-y-auto px-4 py-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Interests */}
        <motion.div variants={staggerItem} className="mb-4">
          <SectionLabel>Interests</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {allInterests.map((interest) => (
              <InterestChip
                key={interest}
                label={interest}
                active={settings.interests.includes(interest)}
                // Each chip toggles membership in `settings.interests`; feed ranking updates on next render.
                onClick={() => toggleInterest(interest)}
              />
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          variants={staggerItem}
          className="flex items-center justify-between mb-4 p-2.5"
          style={{
            borderRadius: tokens.radius.sm + 2,
            background: tokens.colors.bgGlassSubtle,
            border: `1px solid ${tokens.colors.borderSubtle}`,
          }}
        >
          <div>
            <span
              className="block font-medium"
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.78)',
                lineHeight: 1.3,
              }}
            >
              Notifications
            </span>
            <span style={{
              fontSize: 9,
              color: tokens.colors.textMuted,
              lineHeight: 1.3,
            }}>
              Push alerts for breaking updates
            </span>
          </div>
          <ToggleSwitch
            enabled={settings.notifications}
            onToggle={() =>
              updateSettings({ notifications: !settings.notifications })
            }
          />
        </motion.div>

        {/* Widget Size */}
        <motion.div variants={staggerItem} className="mb-4">
          <SectionLabel>Widget Size</SectionLabel>
          <div className="flex gap-1.5">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <OptionPill
                key={size}
                label={size.charAt(0).toUpperCase() + size.slice(1)}
                active={settings.widgetSize === size}
                onClick={() => updateSettings({ widgetSize: size })}
              />
            ))}
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div variants={staggerItem} className="mb-4">
          <SectionLabel>Theme</SectionLabel>
          <div className="flex gap-1.5">
            {(['dark', 'light', 'auto'] as const).map((theme) => (
              <OptionPill
                key={theme}
                label={
                  theme === 'auto'
                    ? 'Auto (System)'
                    : theme.charAt(0).toUpperCase() + theme.slice(1)
                }
                active={settings.theme === theme}
                onClick={() => updateSettings({ theme })}
              />
            ))}
          </div>
        </motion.div>

        {/* Position */}
        <motion.div variants={staggerItem} className="mb-4">
          <SectionLabel>Position</SectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                'top-right',
                'top-left',
                'bottom-right',
                'bottom-left',
              ] as const
            ).map((pos) => (
              <OptionPill
                key={pos}
                label={pos
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
                active={settings.position === pos}
                onClick={() => updateSettings({ position: pos })}
              />
            ))}
          </div>
        </motion.div>

        {/* Version footer */}
        <motion.div variants={staggerItem} className="pt-1.5">
          <div
            className="text-center py-2"
            style={{
              borderTop: `1px solid ${tokens.colors.borderDivider}`,
            }}
          >
            <span style={{
              fontSize: 9,
              color: tokens.colors.textGhost,
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}>
              InfoWidget v0.1.0
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
