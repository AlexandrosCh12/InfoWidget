/**
 * Static demo feed and interest catalog: used for onboarding-driven personalization samples,
 * compact-widget card counts, and matching logic shared with live news filtering (`itemMatchesInterest`).
 * The main UI reads real headlines via `useNews`; this file remains the fallback dataset and interest definitions.
 */
import type { FeedItem } from '../store/widgetStore'
import type { OnboardingActivityLevel } from '../store/widgetStore'

/** Curated cards (charts, crypto, news) for demos and when personalized ordering is computed offline. */
export const feedItems: FeedItem[] = [
  {
    id: '1',
    type: 'market',
    title: 'S&P 500 Hits Record',
    subtitle: 'Index rises 1.2% on strong earnings',
    detail:
      'The S&P 500 reached a new all-time high today, driven by better-than-expected earnings from major tech companies. Trading volume surged 35% above the 20-day average.',
    whyItMatters:
      'Record highs in major indices often signal continued bullish sentiment, but also raise questions about valuations. Portfolio rebalancing may be worth considering.',
    sourceType: 'chart',
    sourceLabel: 'Bloomberg Markets',
    sourceScope: 'internal',
    sourceTarget: 'sp500',
    timestamp: '2m ago',
    accent: 'green',
    icon: 'TrendingUp',
    interestTags: ['Markets', 'Earnings'],
  },
  {
    id: '2',
    type: 'crypto',
    title: 'BTC Breaks $94K',
    subtitle: 'Bitcoin surges past resistance level',
    detail:
      'Bitcoin surpassed the $94,000 mark for the first time, with institutional inflows reaching $2.1B this week. The rally is attributed to growing ETF demand and reduced selling pressure from miners.',
    whyItMatters:
      'This breakout above a key psychological level could trigger further momentum buying. Watch for volume confirmation and potential altcoin rotation.',
    sourceType: 'chart',
    sourceLabel: 'CoinDesk',
    sourceScope: 'internal',
    sourceTarget: 'btc',
    timestamp: '5m ago',
    accent: 'amber',
    icon: 'Bitcoin',
    interestTags: ['Crypto', 'Markets'],
  },
  {
    id: '3',
    type: 'news',
    title: 'Fed Signals Rate Pause',
    subtitle: 'Policy meeting minutes released',
    detail:
      'Federal Reserve meeting minutes reveal a consensus to hold rates steady through Q2. Officials cited cooling inflation data but expressed caution about premature easing.',
    whyItMatters:
      'A prolonged pause could support equity markets while keeping borrowing costs elevated. Bond yields may stabilize, affecting real estate and growth stocks differently.',
    sourceType: 'article',
    sourceLabel: 'Reuters',
    sourceScope: 'external',
    sourceUrl: 'https://www.reuters.com/markets/',
    timestamp: '12m ago',
    accent: 'blue',
    icon: 'Landmark',
    interestTags: ['Economy', 'World News', 'Markets'],
  },
  {
    id: '4',
    type: 'alert',
    title: 'NVDA Earnings Beat',
    subtitle: 'Revenue up 122% year-over-year',
    detail:
      "NVIDIA reported quarterly revenue of $26.3B, beating estimates by $2.1B. Data center revenue tripled, driven by surging AI infrastructure demand from hyperscalers.",
    whyItMatters:
      "NVIDIA's dominance in AI accelerators continues to grow. This signals sustained capex from cloud providers and could lift the entire semiconductor sector.",
    sourceType: 'video',
    sourceLabel: 'CNBC',
    sourceScope: 'internal',
    sourceTarget: 'https://www.youtube.com/embed/tgbNymZ7vqY',
    timestamp: '18m ago',
    accent: 'green',
    icon: 'Cpu',
    interestTags: ['Tech', 'AI / ML', 'Earnings'],
  },
  {
    id: '5',
    type: 'news',
    title: 'WHO Updates Vaccine Guidance',
    subtitle: 'New recommendations for seasonal rollout',
    detail:
      'Health authorities published revised guidance prioritizing vulnerable populations and clarifying booster intervals. Distribution networks are preparing for regional campaigns.',
    whyItMatters:
      'Policy shifts can affect workplace requirements, travel rules, and healthcare planning for families and employers over the next two quarters.',
    sourceType: 'article',
    sourceLabel: 'Associated Press',
    sourceScope: 'external',
    sourceUrl: 'https://apnews.com/',
    timestamp: '24m ago',
    accent: 'blue',
    icon: 'Landmark',
    interestTags: ['World News'],
  },
  {
    id: '6',
    type: 'news',
    title: 'Breakthrough in Solid-State Batteries',
    subtitle: 'Lab demo doubles energy density',
    detail:
      'Researchers demonstrated a prototype cell with significantly higher energy density using a novel electrolyte stack. Commercialization timelines remain uncertain but licensing talks have begun.',
    whyItMatters:
      'If scaled, this could reshape EV range expectations and supply chains for materials currently dominated by incumbent chemistries.',
    sourceType: 'article',
    sourceLabel: 'Nature News',
    sourceScope: 'external',
    sourceUrl: 'https://www.nature.com/',
    timestamp: '31m ago',
    accent: 'amber',
    icon: 'Cpu',
    interestTags: ['Tech', 'Energy', 'Startups'],
  },
  {
    id: '7',
    type: 'news',
    title: 'City Marathon Draws Record Field',
    subtitle: 'Traffic advisories through Sunday',
    detail:
      'Organizers expect 48,000 participants with elite heats starting at dawn. Spectator zones and transit detours are published on the official city mobility page.',
    whyItMatters:
      'Large events can disrupt commutes and last-mile logistics; plan routes if you operate in the metro core this weekend.',
    sourceType: 'article',
    sourceLabel: 'Local Dispatch',
    sourceScope: 'external',
    sourceUrl: 'https://www.openstreetmap.org/',
    timestamp: '40m ago',
    accent: 'green',
    icon: 'Landmark',
    interestTags: ['World News'],
  },
  {
    id: '8',
    type: 'market',
    title: 'Oil Slips on Inventory Build',
    subtitle: 'Crude inventories surprise to the upside',
    detail:
      'Weekly inventory data showed a larger-than-expected build, pressuring front-month contracts. Refinery utilization ticked down amid maintenance season.',
    whyItMatters:
      'Energy prices feed into transport costs and inflation expectations; watch downstream margins if spreads remain volatile.',
    sourceType: 'chart',
    sourceLabel: 'Energy Desk',
    sourceScope: 'internal',
    sourceTarget: 'sp500',
    timestamp: '52m ago',
    accent: 'amber',
    icon: 'TrendingUp',
    interestTags: ['Energy', 'Commodities', 'Economy'],
  },
]

export const allInterests = [
  // Finance & Trading (core)
  'Markets',
  'Stocks',
  'Crypto',
  'Forex',
  'Commodities',
  'Earnings',
  'Economy',
  'Real Estate',
  'Banking',
  // Broader topics
  'Technology',
  'AI / ML',
  'Startups',
  'Energy',
  'Politics',
  'World News',
  'Science',
  'Health',
  'Sports',
  'Entertainment',
  'Climate',
  'Defense',
] as const

const INTEREST_MATCHERS: Record<string, (item: FeedItem) => boolean> = {
  Markets: (item) =>
    item.type === 'market' || /s&p|fed|index|rate|oil|inventory/i.test(`${item.title} ${item.subtitle}`),
  Stocks: (item) => /stock|share|nyse|ipo|dividend|equity/i.test(`${item.title} ${item.subtitle}`),
  Crypto: (item) => item.type === 'crypto' || /bitcoin|btc|crypto/i.test(`${item.title} ${item.subtitle}`),
  Tech: (item) => /nvidia|tech|semiconductor|battery|solid-state/i.test(`${item.title} ${item.subtitle}`),
  'World News': (item) =>
    item.type === 'news' || /fed|geopolitical|policy|who|marathon/i.test(`${item.title} ${item.subtitle}`),
  Economy: (item) => /fed|inflation|economy|yield|inventory/i.test(`${item.title} ${item.subtitle}`),
  Commodities: (item) => /oil|gas|commodity|crude/i.test(`${item.title} ${item.subtitle}`),
  Forex: (item) => /dollar|fx|forex|currency/i.test(`${item.title} ${item.subtitle}`),
  Startups: (item) => /startup|founder|venture|licensing/i.test(`${item.title} ${item.subtitle}`),
  'AI / ML': (item) => /ai|ml|nvidia|infrastructure/i.test(`${item.title} ${item.subtitle}`),
  Energy: (item) => /energy|oil|gas|battery|crude/i.test(`${item.title} ${item.subtitle}`),
  Earnings: (item) => /earnings|revenue|beat|guidance/i.test(`${item.title} ${item.subtitle}`),
  'Real Estate': (item) => /real estate|housing|mortgage|property|reit/i.test(`${item.title} ${item.subtitle}`),
  Banking: (item) => /bank|fed|federal reserve|interest rate|lending|credit/i.test(`${item.title} ${item.subtitle}`),
  Politics: (item) =>
    /trump|congress|senate|election|president|government|policy|white house/i.test(`${item.title} ${item.subtitle}`),
  Science: (item) =>
    /research|study|nasa|space|discovery|physics|biology|climate/i.test(`${item.title} ${item.subtitle}`),
  Health: (item) => /health|fda|drug|vaccine|hospital|medical|disease|cancer/i.test(`${item.title} ${item.subtitle}`),
  Sports: (item) =>
    /nfl|nba|mlb|nhl|soccer|football|basketball|baseball|tennis|olympics/i.test(`${item.title} ${item.subtitle}`),
  Entertainment: (item) =>
    /movie|music|celebrity|netflix|oscar|grammy|film|box office/i.test(`${item.title} ${item.subtitle}`),
  Climate: (item) => /climate|carbon|emission|renewable|solar|wind|esg/i.test(`${item.title} ${item.subtitle}`),
  Defense: (item) =>
    /military|war|nato|army|navy|weapon|missile|defense|conflict/i.test(`${item.title} ${item.subtitle}`),
  Technology: (item) =>
    /apple|google|microsoft|meta|amazon|samsung|chip|software|hardware/i.test(`${item.title} ${item.subtitle}`),
}

/** Shared with `filterArticles` so onboarding interests match live API items the same way as demo data. */
export function itemMatchesInterest(item: FeedItem, interest: string): boolean {
  if (item.interestTags?.includes(interest)) return true
  return INTEREST_MATCHERS[interest]?.(item) ?? false
}

function scoreItem(item: FeedItem, interests: string[]): number {
  if (interests.length === 0) return 0
  let score = 0
  for (const interest of interests) {
    if (itemMatchesInterest(item, interest)) score += 2
  }
  return score
}

/** Balanced ordering when the user has not chosen interests yet (no blind crypto default). */
function defaultDiscoveryOrder(items: FeedItem[]): FeedItem[] {
  const tierA = items.filter((i) => !i.interestTags?.includes('Crypto'))
  const tierB = items.filter((i) => i.interestTags?.includes('Crypto'))
  return [...tierA, ...tierB]
}

function expandedFeedCap(level: OnboardingActivityLevel | null): number {
  if (level === 'Quiet') return 4
  if (level === 'Active / Real-Time') return 8
  return 6
}

/**
 * Builds a capped list from `feedItems` for flows that still use static data (e.g. onboarding previews).
 * With interests: score items, sort by score, take top `cap`. With none: discovery order (non-crypto first).
 * If scoring yields no matches, falls back to the same discovery slice so the UI always has content.
 */
export function getPersonalizedFeed(
  interests: string[],
  activityLevel: OnboardingActivityLevel | null,
): FeedItem[] {
  const cap = expandedFeedCap(activityLevel)
  if (interests.length === 0) {
    return defaultDiscoveryOrder([...feedItems]).slice(0, cap)
  }
  const ranked = [...feedItems]
    .map((item) => ({ item, s: scoreItem(item, interests) }))
    .sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s
      return feedItems.indexOf(a.item) - feedItems.indexOf(b.item)
    })
  const matched = ranked.filter((r) => r.s > 0).map((r) => r.item)
  if (matched.length === 0) {
    return defaultDiscoveryOrder([...feedItems]).slice(0, cap)
  }
  return matched.slice(0, cap)
}

/**
 * How many cards fit in the compact strip: base count from activity level, then clamp/boost by widget size
 * (small caps at 1, large adds one more up to 3).
 */
export function getCompactCardCount(
  activityLevel: OnboardingActivityLevel | null,
  widgetSize: 'small' | 'medium' | 'large',
): number {
  let base =
    activityLevel === 'Quiet' ? 1 : activityLevel === 'Active / Real-Time' ? 3 : 2
  if (widgetSize === 'small') base = Math.min(base, 1)
  if (widgetSize === 'large') base = Math.min(base + 1, 3)
  return base
}
