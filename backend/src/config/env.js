import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_URL: z.string().url().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  // RAG / embeddings (OpenRouter). Optional so the server boots without it;
  // the embedding seed script validates its presence explicitly.
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  // Pinned to the only free embedding model on OpenRouter (2048 dims).
  // Changing it requires re-embedding documents_vectors and altering the column.
  EMBEDDING_MODEL: z.string().min(1).default('nvidia/llama-nemotron-embed-vl-1b-v2:free'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment variables:\n${missing}`);
}

export const env = parsed.data;
