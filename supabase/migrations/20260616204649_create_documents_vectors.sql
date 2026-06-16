-- RAG layer for App BiT: narrative product context the AI uses to *explain*
-- the data (score methodology, glossary, day-period semantics, privacy rules).
-- NOT the structured CDRView data — that lives in SQL tables and is queried,
-- not vectorized. See ARQUITECTURA_DATOS_IA.md section 7.

create extension if not exists vector with schema extensions;

-- Dimension 2048 is fixed by the embedding model
-- (OpenRouter nvidia/llama-nemotron-embed-vl-1b-v2:free, mean-pooled to 2048).
-- Changing the model means re-embedding every row AND altering this column, so
-- the choice is intentionally pinned here.
--
-- No HNSW/IVFFlat index on `embedding`: pgvector caps those indexes at 2000
-- dimensions for the `vector` type, and 2048 exceeds it. It doesn't matter at
-- MVP scale — the corpus is a handful of narrative chunks, so an exact cosine
-- scan is instant. If this table ever grows large, switch the column to
-- `halfvec(2048)` (HNSW supports up to 4000 dims there) and add the index then.
create table if not exists documents_vectors (
  id          bigint generated always as identity primary key,
  fuente      text not null,            -- 'score_metodologia', 'technical_reference_v2', etc.
  seccion     text not null,            -- '4. Score de riesgo', 'Anexo B Glosario', etc.
  contenido   text not null,            -- the chunk of text that gets embedded
  embedding   extensions.vector(2048),  -- nullable: row can be inserted, embedded in a later step
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_documents_vectors_fuente on documents_vectors (fuente);

-- Public read like the other aggregate/non-sensitive tables: the live query path
-- (POST /datos) reads these chunks to build context. Writes happen only from the
-- ingestion/seed script via DATABASE_URL, which bypasses RLS.
alter table documents_vectors enable row level security;

create policy "public read documents_vectors" on documents_vectors
  for select to anon, authenticated using (true);
