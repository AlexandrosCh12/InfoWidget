const CLAUDE_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function generateWhyItMatters(
  title: string,
  description: string,
  source: string
): Promise<string> {
  if (!CLAUDE_API_KEY) {
    return `Reported by ${source}. Tap the source link to read more.`
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [
          {
            role: 'user',
            content: `You are a concise financial and news analyst assistant inside a real-time information widget for active traders and informed people.

Given this news headline and summary, write ONE short actionable insight (2-3 sentences max) telling the user what concrete action or decision they should consider. Be specific — mention actual assets, sectors, or steps when relevant. No fluff, no "stay informed", no "this is important". Just the actionable insight.

Headline: ${title}
Summary: ${description}
Source: ${source}

Actionable insight:`,
          },
        ],
      }),
    })

    const data = await response.json()

    if (data.content && data.content[0]?.text) {
      return data.content[0].text.trim()
    }

    return `Reported by ${source}. Tap the source link to read more.`
  } catch (error) {
    console.error('Claude API error:', error)
    return `Reported by ${source}. Tap the source link to read more.`
  }
}
