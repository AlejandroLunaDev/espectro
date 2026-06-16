import os
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

CDRVIEW_DATA_DIR = os.getenv("CDRVIEW_DATA_DIR", "./data")

# DIRECT_URL (no pgbouncer) es preferible para un batch job de carga masiva:
# evita los limites de prepared statements / server-side cursors del pooler
# en modo transaction. Si no esta disponible, cae a DATABASE_URL pelando el
# query param "pgbouncer" que psycopg2 no reconoce como DSN valido.
_raw_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")

if not _raw_url:
    raise RuntimeError(
        "DIRECT_URL/DATABASE_URL no estan definidas. Copia data-pipeline/.env.example a "
        "data-pipeline/.env y completa la cadena de conexion a Postgres."
    )


def _strip_pgbouncer_param(url: str) -> str:
    parts = urlsplit(url)
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != "pgbouncer"]
    return urlunsplit(parts._replace(query=urlencode(query)))


DATABASE_URL = _strip_pgbouncer_param(_raw_url)
