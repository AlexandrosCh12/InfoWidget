import type { Variants, Transition } from 'framer-motion'
import { tokens } from '../theme/tokens'

const { animation } = tokens

export const smoothTransition: Transition = {
  duration: animation.durationNormal,
  ease: [...animation.easeOutExpo],
}

export const fastTransition: Transition = {
  duration: animation.durationFast,
  ease: [...animation.easeOutExpo],
}

export const springTransition: Transition = {
  ...animation.spring,
}

export const gentleSpring: Transition = {
  ...animation.springGentle,
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: fastTransition },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { ...animation.springGentle } },
  exit: { opacity: 0, y: -4, transition: fastTransition },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { ...animation.springGentle } },
  exit: { opacity: 0, y: 8, transition: fastTransition },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { ...animation.spring } },
  exit: { opacity: 0, scale: 0.98, transition: fastTransition },
}

export const expandPanel: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...animation.springGentle },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 3,
    transition: { duration: animation.durationFast, ease: [...animation.easeOutExpo] },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.025,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: animation.durationNormal, ease: [...animation.easeOutExpo] },
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: { duration: animation.durationFast },
  },
}

export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: tokens.shadow.card,
  },
  hover: {
    scale: 1.015,
    y: -1,
    boxShadow: tokens.shadow.cardHover,
    transition: { duration: animation.durationFast, ease: [...animation.easeOutSmooth] },
  },
  tap: {
    scale: 0.985,
    transition: { duration: 0.08 },
  },
}

export const iconButton = {
  rest: { scale: 1, opacity: 0.45 },
  hover: {
    scale: 1.08,
    opacity: 0.9,
    transition: { duration: animation.durationFast, ease: [...animation.easeOutExpo] },
  },
  tap: { scale: 0.92, opacity: 1, transition: { duration: 0.06 } },
}

export const widgetEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: animation.durationSlow,
      ease: [...animation.easeOutExpo],
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
}
