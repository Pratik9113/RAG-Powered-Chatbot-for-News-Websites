import fetch from 'node-fetch';

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings';

export async function embedTexts(texts) {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) throw new Error('Missing JINA_API_KEY');
  const response = await fetch(JINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v3',
      input: texts
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Jina embeddings error: ${response.status} ${text}`);
  }
  const json = await response.json();
  return json.data.map(d => d.embedding);
}

export async function embedText(text) {
  const [vec] = await embedTexts([text]);
  return vec;
}


