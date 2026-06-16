-- RLS for the CDRView core data tables. Frontend may eventually use the Supabase
-- client directly for Google OAuth (signInWithOAuth runs client-side), which would
-- expose the anon key to the browser. Close the gap now instead of waiting on that
-- decision.
--
-- clusters / antenas_flp / tensor_concentracao / riesgo_regiao: aggregate, non-sensitive
-- data that GET /mapa and POST /datos need to expose -> public read.
--
-- assinantes: per-subscriber granular data (income_cluster). RLS enabled with NO
-- policies = deny-all for anon/authenticated. The live API never reads this table
-- directly (only the pre-aggregated riesgo_regiao); only the ingestion pipeline
-- writes it, using DATABASE_URL which bypasses RLS.

alter table public.clusters enable row level security;
alter table public.antenas_flp enable row level security;
alter table public.tensor_concentracao enable row level security;
alter table public.riesgo_regiao enable row level security;
alter table public.assinantes enable row level security;

create policy "public read clusters" on public.clusters
  for select to anon, authenticated using (true);

create policy "public read antenas_flp" on public.antenas_flp
  for select to anon, authenticated using (true);

create policy "public read tensor_concentracao" on public.tensor_concentracao
  for select to anon, authenticated using (true);

create policy "public read riesgo_regiao" on public.riesgo_regiao
  for select to anon, authenticated using (true);
