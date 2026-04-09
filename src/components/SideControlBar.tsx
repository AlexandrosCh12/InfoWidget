import { motion } from 'framer-motion'
import { invoke } from '@tauri-apps/api/core'
import { Settings, Maximize2, Bell, Minimize2, Minus } from 'lucide-react'
import { useWidgetStore } from '../store/widgetStore'
import { tokens } from '../theme/tokens'

interface SideControlBarProps {
  orientation?: 'vertical' | 'horizontal'
}

export function SideControlBar({ orientation = 'vertical' }: SideControlBarProps) {
  const { viewMode, setViewMode, openSettings, settings, updateSettings } =
    useWidgetStore()
  const isVertical = orientation === 'vertical'

  const buttons = [
    {
      icon: Minus,
      label: 'Minimize to tray',
      onClick: async () => {
        try {
          await invoke('minimize_to_tray')
        } catch {
          /* browser dev — no Tauri */
        }
      },
      active: false,
    },
    {
      icon: viewMode === 'expanded' ? Minimize2 : Maximize2,
      label: viewMode === 'expanded' ? 'Compact' : 'Expand',
      onClick: () => setViewMode(viewMode === 'expanded' ? 'compact' : 'expanded'),
      active: viewMode === 'expanded',
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => openSettings(),
      active: false,
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: () => updateSettings({ notifications: !settings.notifications }),
      active: settings.notifications,
    },
  ]

  return (
    <div
      className={`flex items-center gap-0.5 ${isVertical ? 'flex-col py-1' : 'flex-row px-1'}`}
    >
      {buttons.map((btn) => (
        <motion.button
          key={btn.label}
          onClick={btn.onClick}
          className="relative flex items-center justify-center cursor-pointer"
          style={{
            width: 28,
            height: 28,
            borderRadius: tokens.radius.sm + 1,
            color:
              btn.label === 'Notifications' && btn.active
                ? tokens.colors.accentGreen
                : btn.active
                  ? tokens.colors.accentBlue
                  : tokens.colors.textMuted,
            background:
              btn.label === 'Notifications' && btn.active
                ? tokens.colors.accentGreenSoft
                : btn.active
                  ? tokens.colors.accentBlueSoft
                  : 'transparent',
          }}
          whileHover={{
            color:
              btn.label === 'Notifications' && btn.active
                ? tokens.colors.accentGreen
                : btn.active
                  ? tokens.colors.accentBlue
                  : tokens.colors.textSecondary,
            background: btn.active
              ? btn.label === 'Notifications'
                ? 'rgba(46, 219, 168, 0.12)'
                : 'rgba(75, 141, 248, 0.12)'
              : 'rgba(255, 255, 255, 0.04)',
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.12, ease: [0.22, 0.68, 0, 1] }}
          title={btn.label}
        >
          <btn.icon size={13.5} strokeWidth={1.7} />
          {btn.active && (
            <motion.div
              layoutId="controlIndicator"
              className="absolute rounded-full"
              style={{
                width: 2.5,
                height: 2.5,
                background: tokens.colors.accentBlue,
                boxShadow: `0 0 4px ${
                  btn.label === 'Notifications'
                    ? tokens.colors.accentGreenGlow
                    : tokens.colors.accentBlueGlow
                }`,
                ...(btn.label === 'Notifications'
                  ? { background: tokens.colors.accentGreen }
                  : {}),
                ...(isVertical
                  ? { right: 0, top: '50%', transform: 'translateY(-50%)' }
                  : { bottom: 0, left: '50%', transform: 'translateX(-50%)' }),
              }}
              transition={{ ...tokens.animation.springSnappy }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}
