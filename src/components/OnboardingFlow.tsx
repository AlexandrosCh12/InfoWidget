import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import {
  useWidgetStore,
  type OnboardingActivityLevel,
  type OnboardingPurpose,
  type OnboardingTopic,
} from '../store/widgetStore'
import { tokens } from '../theme/tokens'

const PURPOSE_OPTIONS: OnboardingPurpose[] = [
  'General Updates',
  'Day Trading',
  'Crypto',
  'Investing',
  'Business News',
  'AI/Tech',
  'Marketing',
  'Custom',
]

const TOPIC_OPTIONS: OnboardingTopic[] = [
  'Markets',
  'Geopolitics',
  'Oil/Gas',
  'Earnings',
  'Crypto',
  'AI',
  'Startups',
]

const ACTIVITY_OPTIONS: OnboardingActivityLevel[] = [
  'Quiet',
  'Important Updates Only',
  'Active / Real-Time',
]

function StepChip({
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
      className="relative flex items-center gap-1.5 cursor-pointer px-3 py-2"
      onClick={onClick}
      aria-pressed={active}
      style={{
        borderRadius: tokens.radius.sm + 2,
        border: `1px solid ${active ? 'rgba(75, 141, 248, 0.25)' : tokens.colors.borderSubtle}`,
        background: active ? tokens.colors.accentBlueSoft : tokens.colors.bgGlassSubtle,
        color: active ? tokens.colors.textPrimary : tokens.colors.textSecondary,
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
      whileHover={{
        borderColor: active ? 'rgba(75, 141, 248, 0.35)' : tokens.colors.borderHover,
        background: active ? 'rgba(75, 141, 248, 0.12)' : tokens.colors.bgGlassSubtleHover,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12, ease: [...tokens.animation.easeOutSmooth] }}
    >
      {active ? <Check size={10} strokeWidth={2.5} /> : null}
      {label}
    </motion.button>
  )
}

export function OnboardingFlow() {
  const onboarding = useWidgetStore((s) => s.onboarding)
  const updateOnboarding = useWidgetStore((s) => s.updateOnboarding)
  const completeOnboarding = useWidgetStore((s) => s.completeOnboarding)
  const [step, setStep] = useState(0)
  const [purpose, setPurpose] = useState<OnboardingPurpose[]>(onboarding.purpose)
  const [topics, setTopics] = useState<OnboardingTopic[]>(onboarding.topics)
  const [activityLevel, setActivityLevel] = useState<OnboardingActivityLevel | null>(
    onboarding.activityLevel,
  )

  const togglePurpose = (value: OnboardingPurpose) =>
    setPurpose((current) => {
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      updateOnboarding({ purpose: next })
      return next
    })

  const toggleTopic = (value: OnboardingTopic) =>
    setTopics((current) => {
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      updateOnboarding({ topics: next })
      return next
    })

  const canProceed =
    (step === 0 && purpose.length > 0) ||
    (step === 1 && topics.length > 0) ||
    (step === 2 && Boolean(activityLevel))

  return (
    <div className="h-full flex flex-col px-4 py-3">
      <div
        className="pb-2.5"
        style={{ borderBottom: `1px solid ${tokens.colors.borderDivider}` }}
      >
        <span
          style={{
            fontSize: 9,
            color: tokens.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}
        >
          Welcome
        </span>
        <h1
          style={{
            marginTop: 4,
            fontSize: 14,
            lineHeight: 1.25,
            fontWeight: 650,
            color: tokens.colors.textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          Configure your widget
        </h1>
      </div>

      <div className="pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  index <= step ? tokens.colors.accentBlue : 'rgba(255, 255, 255, 0.08)',
                opacity: index <= step ? 0.8 : 1,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        key={step}
        className="flex-1 overflow-y-auto py-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [...tokens.animation.easeOutExpo] }}
      >
        {step === 0 ? (
          <>
            <h2
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: tokens.colors.textPrimary,
                marginBottom: 6,
              }}
            >
              What do you want this widget for?
            </h2>
            <p style={{ fontSize: 9.5, color: tokens.colors.textMuted, marginBottom: 10 }}>
              Select one or more primary goals.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PURPOSE_OPTIONS.map((option) => (
                <StepChip
                  key={option}
                  label={option}
                  active={purpose.includes(option)}
                  onClick={() => togglePurpose(option)}
                />
              ))}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h2
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: tokens.colors.textPrimary,
                marginBottom: 6,
              }}
            >
              Which topics matter most?
            </h2>
            <p style={{ fontSize: 9.5, color: tokens.colors.textMuted, marginBottom: 10 }}>
              Pick the themes you want prioritized.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_OPTIONS.map((option) => (
                <StepChip
                  key={option}
                  label={option}
                  active={topics.includes(option)}
                  onClick={() => toggleTopic(option)}
                />
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: tokens.colors.textPrimary,
                marginBottom: 6,
              }}
            >
              How active should the widget be?
            </h2>
            <p style={{ fontSize: 9.5, color: tokens.colors.textMuted, marginBottom: 10 }}>
              This controls how aggressively updates surface.
            </p>
            <div className="flex flex-col gap-1.5">
              {ACTIVITY_OPTIONS.map((option) => (
                <StepChip
                  key={option}
                  label={option}
                  active={activityLevel === option}
                  onClick={() => {
                    setActivityLevel(option)
                    updateOnboarding({ activityLevel: option })
                  }}
                />
              ))}
            </div>
          </>
        ) : null}
      </motion.div>

      <div
        className="flex items-center justify-between gap-2 pt-2.5"
        style={{ borderTop: `1px solid ${tokens.colors.borderDivider}` }}
      >
        <button
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
          className="cursor-pointer px-3 py-1.5 disabled:cursor-default"
          style={{
            borderRadius: tokens.radius.sm + 1,
            border: `1px solid ${tokens.colors.borderSubtle}`,
            color: step === 0 ? tokens.colors.textGhost : tokens.colors.textSecondary,
            background: tokens.colors.bgGlassSubtle,
            fontSize: 10.5,
            fontWeight: 500,
          }}
        >
          Back
        </button>

        {step < 2 ? (
          <button
            onClick={() => setStep((current) => current + 1)}
            disabled={!canProceed}
            className="cursor-pointer px-3 py-1.5 disabled:cursor-default"
            style={{
              borderRadius: tokens.radius.sm + 1,
              border: `1px solid ${canProceed ? 'rgba(75, 141, 248, 0.32)' : tokens.colors.borderSubtle}`,
              color: canProceed ? tokens.colors.textPrimary : tokens.colors.textGhost,
              background: canProceed ? tokens.colors.accentBlueSoft : tokens.colors.bgGlassSubtle,
              fontSize: 10.5,
              fontWeight: 600,
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => {
              if (!activityLevel) return
              completeOnboarding({ purpose, topics, activityLevel })
            }}
            disabled={!canProceed || !activityLevel}
            className="cursor-pointer px-3 py-1.5 disabled:cursor-default"
            style={{
              borderRadius: tokens.radius.sm + 1,
              border: `1px solid ${canProceed ? 'rgba(46, 219, 168, 0.32)' : tokens.colors.borderSubtle}`,
              color: canProceed ? tokens.colors.textPrimary : tokens.colors.textGhost,
              background: canProceed ? tokens.colors.accentGreenSoft : tokens.colors.bgGlassSubtle,
              fontSize: 10.5,
              fontWeight: 600,
            }}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  )
}
