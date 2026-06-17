import pg from 'pg';
import { env } from '../config/env.js';

// Shared Postgres pool for raw SQL the app needs but Prisma/supabase-js don't
// cover well — notably pgvector similarity search. Uses DIRECT_URL (session
// mode) to avoid pgbouncer prepared-statement quirks. Connects with the DB
// credentials, so it bypasses RLS — keep it to read paths the API already
// exposes (riesgo_regiao, documents_vectors are public-read anyway).

export const pool = new pg.Pool({
  connectionString: env.DIRECT_URL || env.DATABASE_URL,
  max: 5,
});

export function query(text, params) {
  return pool.query(text, params);
}
