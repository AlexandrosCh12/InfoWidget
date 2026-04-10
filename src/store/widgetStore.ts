/**
 * Global UI state for the widget (Zustand): view mode, selected article, settings, onboarding,
 * and source overlays. Any component can subscribe to slices; actions persist settings/onboarding
 * to localStorage where configured.
 */
import { create } from 'zustand'
import { openExternalUrl } from '../utils/openExternalUrl'

export type ViewMode = 'onboarding' | 'compact' | 'expanded' | 'settings'

/** Main widget surface (not onboarding, not settings overlay). */
export type ShellViewMode = 'compact' | 'expanded'

export type SourceScope = 'external' | 'internal'

export type SourceOverlayState =
  | null
  | {
      kind: 'video'
      title: string
      embedUrl: string
    }
  | {
      kind: 'chart'
      title: string
      subtitle?: string
      chartKey: string
    }

export interface FeedItem {
  id: string
  type: 'market' | 'news' | 'crypto' | 'alert'
  title: string
  subtitle: string
  detail: string
  whyItMatters: string
  sourceType: 'article' | 'video' | 'chart'
  /** Display name shown in the source row (e.g. publisher) */
  sourceLabel: string
  /** Open in default browser vs in-app overlay */
  sourceScope: SourceScope
  /** HTTPS URL when `sourceScope` is external */
  sourceUrl?: string
  /** In-app key or embed URL when `sourceScope` is internal (chart id or video iframe URL) */
  sourceTarget?: string
  timestamp: string
  accent: 'blue' | 'green' | 'red' | 'amber'
  icon: string
  /** Explicit interest tags for personalization (subset of catalog interests). */
  interestTags?: string[]
}

export interface WidgetSettings {
  interests: string[]
  notifications: boolean
  widgetSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark' | 'auto'
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export type OnboardingPurpose =
  | 'General Updates'
  | 'Day Trading'
  | 'Crypto'
  | 'Investing'
  | 'Business News'
  | 'AI/Tech'
  | 'Marketing'
  | 'Custom'

export type OnboardingTopic =
  | 'Markets'
  | 'Geopolitics'
  | 'Oil/Gas'
  | 'Earnings'
  | 'Crypto'
  | 'AI'
  | 'Startups'

export type OnboardingActivityLevel =
  | 'Quiet'
  | 'Important Updates Only'
  | 'Active / Real-Time'

export interface OnboardingState {
  completed: boolean
  purpose: OnboardingPurpose[]
  topics: OnboardingTopic[]
  activityLevel: OnboardingActivityLevel | null
}

/** Application state: navigation shell, content selection, user preferences, and onboarding progress. */
interface WidgetState {
  // --- Navigation & shell: which full-screen mode is active (onboarding, compact, expanded, settings). ---
  viewMode: ViewMode
  /** Restored when leaving settings (compact vs expanded feed/detail). */
  previousShellView: ShellViewMode
  /** When opening settings from expanded detail, we keep selection; this preserves back behavior. */
  selectedItem: FeedItem | null
  // --- In-app overlays: video embed or chart when source is internal. ---
  sourceOverlay: SourceOverlayState
  // --- Settings: interests, notifications, chrome (size/theme/position); persisted. ---
  settings: WidgetSettings
  // --- Onboarding: first-run flow state; persisted when updated or completed. ---
  onboarding: OnboardingState
  isLive: boolean

  /** Switch onboarding / compact / expanded. Clears selection when toggling compact ↔ expanded. */
  setViewMode: (mode: Exclude<ViewMode, 'settings'>) => void
  openSettings: () => void
  /** Unified back: settings → prior shell; detail → feed. */
  goBack: () => void
  /** Opens the full feed from compact and clears detail selection. */
  expandToFeed: () => void
  /** Opens expanded view with this item as the detail target. */
  selectItem: (item: FeedItem) => void
  clearSelection: () => void
  closeSourceOverlay: () => void
  /** Opens external URL or sets internal video/chart overlay from a feed item. */
  activateItemSource: (item: FeedItem) => void
  updateSettings: (partial: Partial<WidgetSettings>) => void
  /** Adds or removes one interest chip; persists the updated `settings.interests` array. */
  toggleInterest: (interest: string) => void
  closeSettings: () => void
  updateOnboarding: (partial: Partial<OnboardingState>) => void
  completeOnboarding: (payload: {
    purpose: OnboardingPurpose[]
    topics: OnboardingTopic[]
    activityLevel: OnboardingActivityLevel
  }) => void
}

/** Neutral until onboarding completes; avoids a crypto/trading-heavy default. */
const defaultSettings: WidgetSettings = {
  interests: [],
  notifications: true,
  widgetSize: 'medium',
  theme: 'auto',
  position: 'top-right',
}

const defaultOnboarding: OnboardingState = {
  completed: false,
  purpose: [],
  topics: [],
  activityLevel: null,
}

type SettingsPersistenceAdapter = {
  load: () => WidgetSettings | null
  save: (settings: WidgetSettings) => void
}

type OnboardingPersistenceAdapter = {
  load: () => OnboardingState | null
  save: (onboarding: OnboardingState) => void
}

const SETTINGS_KEY = 'infowidget.settings.v1'
const ONBOARDING_KEY = 'infowidget.onboarding.v1'

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

/** Load/save widget preferences (interests, UI options) under a versioned localStorage key. */
function createLocalStorageSettingsPersistence(): SettingsPersistenceAdapter {
  return {
    load: () => {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (!raw) return null
        return JSON.parse(raw) as WidgetSettings
      } catch (err) {
        console.warn('InfoWidget: failed to load settings from storage.', err)
        return null
      }
    },
    save: (settings) => {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      } catch (err) {
        console.warn(
          isQuotaError(err)
            ? 'InfoWidget: storage quota exceeded — settings will not persist across sessions.'
            : 'InfoWidget: settings could not be saved (possibly private/incognito mode).',
          err,
        )
      }
    },
  }
}

/** Persists onboarding answers so first-run flow does not repeat after refresh. */
function createLocalStorageOnboardingPersistence(): OnboardingPersistenceAdapter {
  return {
    load: () => {
      try {
        const raw = localStorage.getItem(ONBOARDING_KEY)
        if (!raw) return null
        return JSON.parse(raw) as OnboardingState
      } catch (err) {
        console.warn('InfoWidget: failed to load onboarding state from storage.', err)
        return null
      }
    },
    save: (onboarding) => {
      try {
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboarding))
      } catch (err) {
        console.warn(
          isQuotaError(err)
            ? 'InfoWidget: storage quota exceeded — onboarding state will not persist.'
            : 'InfoWidget: onboarding state could not be saved (possibly private/incognito mode).',
          err,
        )
      }
    },
  }
}

const settingsPersistence = createLocalStorageSettingsPersistence()
const onboardingPersistence = createLocalStorageOnboardingPersistence()
const onboardingSnapshot = onboardingPersistence.load() ?? defaultOnboarding

/** Maps onboarding "purpose" picks to concrete interest labels merged into settings on complete. */
const PURPOSE_TO_INTERESTS: Record<OnboardingPurpose, string[]> = {
  'General Updates': ['World News', 'Technology', 'Economy'],
  'Day Trading': ['Markets', 'Earnings', 'Forex'],
  Crypto: ['Crypto', 'Markets'],
  Investing: ['Markets', 'Economy', 'World News'],
  'Business News': ['World News', 'Economy', 'Markets'],
  'AI/Tech': ['Technology', 'AI / ML', 'Startups'],
  Marketing: ['Startups', 'Technology'],
  Custom: [],
}

/** Maps topic chips from onboarding to a single catalog interest each. */
const TOPIC_TO_INTEREST: Record<OnboardingTopic, string> = {
  Markets: 'Markets',
  Geopolitics: 'World News',
  'Oil/Gas': 'Energy',
  Earnings: 'Earnings',
  Crypto: 'Crypto',
  AI: 'AI / ML',
  Startups: 'Startups',
}

export const useWidgetStore = create<WidgetState>((set) => ({
  // Initial view: onboarding until completed, then compact shell.
  viewMode: onboardingSnapshot.completed ? 'compact' : 'onboarding',
  previousShellView: 'compact',
  selectedItem: null,
  sourceOverlay: null,
  isLive: true,
  settings: settingsPersistence.load() ?? defaultSettings,
  onboarding: onboardingPersistence.load() ?? defaultOnboarding,

  setViewMode: (mode) =>
    set((state) => {
      const isMainSwap =
        (mode === 'compact' || mode === 'expanded') &&
        (state.viewMode === 'compact' || state.viewMode === 'expanded')
      return {
        viewMode: mode,
        previousShellView:
          mode === 'compact' || mode === 'expanded' ? mode : state.previousShellView,
        ...(isMainSwap ? { selectedItem: null, sourceOverlay: null } : {}),
      }
    }),

  openSettings: () =>
    set((state) => {
      if (state.viewMode === 'settings' || state.viewMode === 'onboarding') return {}
      const shell: ShellViewMode =
        state.viewMode === 'compact' ? 'compact' : 'expanded'
      return {
        viewMode: 'settings',
        previousShellView: shell,
        sourceOverlay: null,
      }
    }),

  goBack: () =>
    set((state) => {
      if (state.viewMode === 'settings') {
        return {
          viewMode: state.previousShellView,
        }
      }
      if (state.viewMode === 'expanded' && state.selectedItem) {
        return { selectedItem: null, sourceOverlay: null }
      }
      return {}
    }),

  expandToFeed: () =>
    set((state) => {
      if (state.viewMode === 'onboarding') return {}
      return {
        viewMode: 'expanded',
        previousShellView: 'expanded',
        selectedItem: null,
        sourceOverlay: null,
      }
    }),

  selectItem: (item) => set({ selectedItem: item, viewMode: 'expanded', sourceOverlay: null }),

  clearSelection: () => set({ selectedItem: null, sourceOverlay: null }),

  closeSourceOverlay: () => set({ sourceOverlay: null }),

  activateItemSource: (item) => {
    if (item.sourceScope === 'external') {
      const url = item.sourceUrl?.trim()
      if (!url) return
      void openExternalUrl(url)
      return
    }
    if (item.sourceType === 'video' && item.sourceTarget) {
      set({
        sourceOverlay: {
          kind: 'video',
          title: item.title,
          embedUrl: item.sourceTarget,
        },
      })
      return
    }
    if (item.sourceType === 'chart' && item.sourceTarget) {
      set({
        sourceOverlay: {
          kind: 'chart',
          title: item.title,
          subtitle: item.subtitle,
          chartKey: item.sourceTarget,
        },
      })
    }
  },

  updateSettings: (partial) =>
    set((state) => {
      const settings = { ...state.settings, ...partial }
      settingsPersistence.save(settings)
      return { settings }
    }),

  toggleInterest: (interest) =>
    set((state) => {
      const interests = state.settings.interests.includes(interest)
        ? state.settings.interests.filter((i) => i !== interest)
        : [...state.settings.interests, interest]
      const settings = { ...state.settings, interests }
      settingsPersistence.save(settings)
      return { settings }
    }),

  closeSettings: () =>
    set((state) => {
      if (state.viewMode !== 'settings') return {}
      return {
        viewMode: state.previousShellView,
      }
    }),

  updateOnboarding: (partial) =>
    set((state) => {
      const onboarding = { ...state.onboarding, ...partial }
      onboardingPersistence.save(onboarding)
      return { onboarding }
    }),

  completeOnboarding: ({ purpose, topics, activityLevel }) =>
    set((state) => {
      const interests = Array.from(
        new Set([
          ...purpose.flatMap((selection) => PURPOSE_TO_INTERESTS[selection]),
          ...topics.map((topic) => TOPIC_TO_INTEREST[topic]),
        ]),
      )
      const fallback = ['World News', 'Tech']
      const nextSettings: WidgetSettings = {
        ...state.settings,
        interests: interests.length > 0 ? interests : fallback,
        notifications: activityLevel !== 'Quiet',
      }
      const onboarding: OnboardingState = {
        completed: true,
        purpose,
        topics,
        activityLevel,
      }
      settingsPersistence.save(nextSettings)
      onboardingPersistence.save(onboarding)
      return {
        onboarding,
        settings: nextSettings,
        viewMode: 'compact',
        previousShellView: 'compact',
      }
    }),
}))
