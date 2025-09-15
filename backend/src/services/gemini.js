import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  return new GoogleGenerativeAI(apiKey);
}

export async function generateAnswer({ question, contexts }) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL });
  const system = `You are a helpful news assistant. Answer using the provided context snippets. If the answer isn't in the context, say you are not sure.`;
  const contextText = contexts.map((c, i) => `Snippet ${i + 1} (score ${c.score.toFixed(3)}):\nTitle: ${c.title || 'Untitled'}\nURL: ${c.url || 'N/A'}\nText: ${c.content.slice(0, 1200)}`).join('\n\n');
  const prompt = `${system}\n\nContext:\n${contextText}\n\nQuestion: ${question}\n\nAnswer:`;

  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e);
      // Backoff on 429
      if (msg.includes('429') || msg.includes('RATE_LIMIT')) {
        const delayMs = 500 * attempt;
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      break;
    }
  }
  return 'I am temporarily rate limited by the LLM API. Please try again in a moment.';
}


