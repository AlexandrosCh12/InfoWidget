export interface RawArticle {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  publishedAt?: string;
  source?: { name?: string };
  [key: string]: unknown;
}

export interface FeedItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  detail: string;
  whyItMatters: string;
  sourceType: string;
  sourceLabel: string;
  sourceScope: string;
  sourceUrl: string;
  sourceTarget: undefined;
  timestamp: string;
  accent: string;
  icon: string;
  interestTags: string[];
}

export function fetchTopHeadlines(pageSize?: number): Promise<RawArticle[]>;
export function adaptArticle(article: RawArticle, index: number): FeedItem;