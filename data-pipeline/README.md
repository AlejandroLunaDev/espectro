# data-pipeline

Pipeline standalone en Python que ingesta el dataset CDRView (Visent/Wongola)
en Supabase/Postgres y calcula el score de riesgo de exclusion digital por
cluster geografico (tabla `riesgo_regiao`). No es un workspace de pnpm ni
forma parte del CI/lint/build de Node — vive aislado en este directorio.

Slice 1 de la arquitectura de datos/IA (issue #12): ingesta + scoring.
RAG/pgvector y los endpoints de Express quedan fuera de este alcance.

## Setup

```bash
cd data-pipeline
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

Copia `.env.example` a `.env` y completa `DATABASE_URL` con la cadena de
conexion directa a Postgres (mismo valor que usa `backend/src/config/env.js`,
no la URL del pooler/anon key — esta conexion bypassa RLS intencionalmente).

```bash
cp .env.example .env
```

## Dataset

Los CSV del dataset CDRView **no estan en el repo**. Coloca los archivos en
el directorio indicado por `CDRVIEW_DATA_DIR` (default `./data`, relativo a
`data-pipeline/`):

```
data-pipeline/data/
  antenas_flp.csv
  assinantes.csv
  tensor_concentracao.csv
  tensor_mobilidade.csv
```

**No commitees los CSV.** `data-pipeline/data/` esta en el `.gitignore` raiz.

`tensor_mobilidade.csv` pesa ~2.7GB (~12M filas). El pipeline **solo lo lee
en chunks** (`mobilidade.py`) para calcular `pct_legacy_tech` por cluster —
nunca se carga entero en memoria ni se inserta en Postgres.

## Uso

```bash
python main.py
```

Orden de ejecucion:

1. Verifica que `clusters` ya tenga datos (sembrados por la migracion de
   Supabase; el pipeline no los vuelve a cargar).
2. Carga `antenas_flp`, `assinantes` y `tensor_concentracao` (truncate +
   insert, full reload en cada corrida).
3. Calcula `pct_legacy_tech` por cluster leyendo `tensor_mobilidade.csv` en
   chunks.
4. Calcula el score de riesgo por cluster y hace upsert en `riesgo_regiao`.

## Tests

```bash
pytest tests/
```

Los tests de `tests/test_score.py` son unitarios puros sobre `score.py` (sin
DB ni CSV) y corren sin tener el dataset presente.
