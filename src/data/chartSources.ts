/** Keys match `FeedItem.sourceTarget` for internal chart sources */
export const CHART_SOURCE_CONFIG: Record<
  string,
  {
    linePath: string
    areaPath: string
    lineColor: string
    fillStops: [string, string]
    caption: string
  }
> = {
  sp500: {
    linePath: 'M 0 58 Q 28 48 52 50 T 102 34 T 154 24 T 200 14',
    areaPath:
      'M 0 58 Q 28 48 52 50 T 102 34 T 154 24 T 200 14 L 200 72 L 0 72 Z',
    lineColor: 'rgba(46, 219, 168, 0.85)',
    fillStops: ['rgba(46, 219, 168, 0.14)', 'rgba(46, 219, 168, 0)'],
    caption: 'S&P 500 — intraday (mock)',
  },
  btc: {
    linePath: 'M 0 52 Q 40 62 72 38 T 132 48 T 200 18',
    areaPath: 'M 0 52 Q 40 62 72 38 T 132 48 T 200 18 L 200 72 L 0 72 Z',
    lineColor: 'rgba(247, 169, 40, 0.9)',
    fillStops: ['rgba(247, 169, 40, 0.12)', 'rgba(247, 169, 40, 0)'],
    caption: 'BTC / USD — spot (mock)',
  },
}
