import { env } from '../config/env.js';

// Thin client over OpenRouter's OpenAI-compatible embeddings endpoint.
// Used to turn narrative text into vectors for documents_vectors (RAG).
// The SAME model must embed both the stored chunks and any future query, or
// cosine distances are meaningless — the model is pinned via EMBEDDING_MODEL.

const MAX_RETRIES = 5;

function requireApiKey() {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error(
      'OPENROUTER_API_KEY no esta definida. Agregala a backend/.env para generar embeddings.',
    );
  }
  return env.OPENROUTER_API_KEY;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Embed a single text into a vector using the pinned OpenRouter model.
 * Retries on 429 honoring retry-after, since the free model is rate-limited
 * (20 req/min). Returns a plain number[] of length 2048.
 */
export async function embedText(input) {
  const apiKey = requireApiKey();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const res = await fetch(`${env.OPENROUTER_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: env.EMBEDDING_MODEL, input }),
    });

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt;
      await sleep(retryAfter * 1000);
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenRouter embeddings ${res.status}: ${body}`);
    }

    const json = await res.json();
    const embedding = json?.data?.[0]?.embedding;
    if (!Array.isArray(embedding)) {
      throw new Error('OpenRouter no devolvio un embedding valido');
    }
    return embedding;
  }

  throw new Error('OpenRouter embeddings: agotados los reintentos por rate limit (429)');
}
