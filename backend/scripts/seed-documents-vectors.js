import 'dotenv/config';
import pg from 'pg';
import { env } from '../src/config/env.js';
import { embedText } from '../src/lib/openrouter.js';
import { RAG_DOCUMENTS } from '../src/data/rag-documents.js';

// One-time seed of the RAG knowledge base into documents_vectors.
// Idempotent: truncates and re-inserts every run, so editing rag-documents.js
// and re-running fully refreshes the table.
//
// Connects via DIRECT_URL (direct Postgres, bypasses RLS — only this script
// writes the table; the live API reads it). Embeddings come from the pinned
// OpenRouter model (EMBEDDING_MODEL).

function toVectorLiteral(embedding) {
  return `[${embedding.join(',')}]`;
}

async function main() {
  const connectionString = env.DIRECT_URL || env.DATABASE_URL;
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    await client.query('TRUNCATE TABLE documents_vectors RESTART IDENTITY');

    let inserted = 0;
    for (const doc of RAG_DOCUMENTS) {
      const embedding = await embedText(doc.contenido);
      await client.query(
        `INSERT INTO documents_vectors (fuente, seccion, contenido, embedding)
         VALUES ($1, $2, $3, $4::extensions.vector)`,
        [doc.fuente, doc.seccion, doc.contenido, toVectorLiteral(embedding)],
      );
      inserted += 1;
      console.log(`  embebido (${embedding.length} dims): ${doc.fuente} / ${doc.seccion}`);
    }

    console.log(`\nSeed completado: ${inserted} documentos vectorizados en documents_vectors.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Seed fallido:', err.message);
  process.exit(1);
});
