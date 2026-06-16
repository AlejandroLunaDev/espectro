-- Algunos clusters de referencia no tienen ninguna antena en el dataset (zonas
-- rurales/perifericas). Eso no es "sin riesgo": es la peor senal de exclusion
-- digital posible (cero infraestructura, ni siquiera medible). sin_cobertura
-- distingue ese caso de un score alto calculado a partir de datos reales, para
-- que la IA pueda explicarlo con precision en vez de inferirlo de campos en cero.
alter table public.riesgo_regiao
  add column if not exists sin_cobertura boolean not null default false;
