/**
 * Interest-based filtering for live news: we score each article by how many of the user's
 * selected interests match title + subtitle text (regex per interest). Higher score = more relevant;
 * results are sorted by score descending. This keeps the expanded feed aligned with settings without
 * requiring manual tagging on every API article.
 */
import type { FeedItem } from '../store/widgetStore'

// Maps each catalog interest label to a case-insensitive regex tested against "title + subtitle".
// To add a new interest: add a key matching `allInterests` in feedData and a pattern that signals that topic.
const MATCHERS: Record<string, RegExp> = {
  'Markets':       /s&p|dow|nasdaq|index|stock market|equity|bull|bear|wall street/i,
  'Stocks':        /\bstock\b|shares|nyse|ipo|dividend|earnings per share/i,
  'Crypto':        /bitcoin|crypto|btc|eth|ethereum|coin|token|blockchain|binance|defi/i,
  'Forex':         /\bdollar\b|forex|currency|euro|yen|pound|exchange rate/i,
  'Commodities':   /\boil\b|\bgold\b|\bsilver\b|natural gas|commodity|crude|wheat|copper/i,
  'Earnings':      /earnings|quarterly results|revenue|profit|loss|beat estimates|guidance/i,
  'Economy':       /inflation|gdp|federal reserve|recession|unemployment|interest rate|economy/i,
  'Real Estate':   /real estate|housing market|mortgage|property|home sales|reit/i,
  'Banking':       /\bbank\b|jpmorgan|goldman|wells fargo|federal reserve|lending|credit/i,
  'Technology':    /apple|google|microsoft|meta|amazon|samsung|semiconductor|chip|software/i,
  'AI / ML':       /artificial intelligence|\bai\b|machine learning|nvidia|llm|chatgpt|openai|gemini/i,
  'Startups':      /startup|venture capital|series [ab]|funding round|unicorn/i,
  'Energy':        /\benergy\b|\boil\b|solar|wind power|nuclear|renewable|opec/i,
  'Politics':      /trump|congress|senate|election|president|government|policy|white house|democrat|republican/i,
  'World News':    /\bwar\b|conflict|treaty|summit|united nations|nato|international|foreign/i,
  'Science':       /nasa|space|research study|scientific|discovery|physics|biology|quantum/i,
  'Health':        /\bhealth\b|fda|vaccine|hospital|medical|disease|cancer|drug approval/i,
  'Sports':        /nfl|nba|mlb|nhl|premier league|soccer|football|basketball|baseball|tennis|olympics|fifa/i,
  'Entertainment': /\bmovie\b|\bfilm\b|music|celebrity|netflix|oscar|grammy|box office|hollywood/i,
  'Climate':       /climate change|carbon|emissions|renewable energy|global warming|esg|sustainability/i,
  'Defense':       /military|pentagon|army|navy|air force|weapon|missile|defense contractor/i,
}

/**
 * @param articles - Adapted feed items (from `useNews`).
 * @param interests - User's selected interest strings from the widget store (empty = no filtering).
 * @returns Same articles filtered and ordered by relevance, or the original list when no interests are set.
 */
export function filterAndRankArticles(
  articles: FeedItem[],
  interests: string[]
): FeedItem[] {
  if (!interests || interests.length === 0) return articles;

  // One point per interest whose regex matches; multiple interests can stack on the same article.
  const scored = articles.map((article) => {
    const text = `${article.title} ${article.subtitle}`.toLowerCase();
    let score = 0;
    for (const interest of interests) {
      if (MATCHERS[interest]?.test(text)) score += 1;
    }
    return { article, score };
  });

  const matched = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.article);

  // If nothing matched (e.g. keywords too narrow), show a small unfiltered slice so the feed never goes empty.
  if (matched.length === 0) {
    return articles.slice(0, 10);
  }

  return matched;
}
