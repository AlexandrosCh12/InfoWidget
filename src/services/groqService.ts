/**
 * Groq AI integration: calls Groq's OpenAI-compatible chat API to generate a short
 * "why this matters" insight for a news item. Used from DetailPanel when the user opens a story.
 */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Returns a 2–3 sentence actionable insight for the headline, or a static fallback if the API is unavailable.
 *
 * @param title - Article headline shown in the UI.
 * @param description - Subtitle / summary passed as context.
 * @param source - Publisher name for attribution in fallbacks.
 */
export async function generateWhyItMatters(
  title: string,
  description: string,
  source: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    return `Reported by ${source}. Tap the source link to read more.`;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 120,
        messages: [
          {
            role: 'system',
            // System prompt: frames the model as a trading-oriented analyst so outputs are concrete
            // (assets, sectors, steps). Banned phrases avoid generic filler that duplicates the static fallback.
            content: `You are a concise analyst inside a real-time information widget for active traders and informed decision-makers. 
Your job is to write ONE short actionable insight (2-3 sentences max) for each news item.
Tell the user exactly what concrete action or decision they should consider.
Be specific — mention actual assets, sectors, companies, or steps when relevant.
Never say "stay informed", "this is important", or "consider reading more".
Just give the actionable insight directly. No preamble.`
          },
          {
            role: 'user',
            // User message: passes only the facts we have (headline, summary, source) and asks for a decision lens.
            content: `Headline: ${title}
Summary: ${description}
Source: ${source}

What should I do or watch for based on this news?`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();

    // OpenAI-style response: first choice's assistant message holds the completion text.
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }

    return `Reported by ${source}. Tap the source link to read more.`;
  } catch (error) {
    console.error('Groq API error:', error);
    return `Reported by ${source}. Tap the source link to read more.`;
  }
}
