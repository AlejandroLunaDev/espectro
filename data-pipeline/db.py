import psycopg2
import psycopg2.extras

from config import DATABASE_URL


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def truncate_and_bulk_insert(conn, table: str, columns: list[str], rows: list[tuple]) -> int:
    """Recarga completa: las 3 tablas crudas se reciben full-load en cada corrida
    del dataset fuente, asi que truncate+insert es mas simple y barato que upsert
    fila por fila (no hay PK parcial que preservar entre corridas)."""
    cols_sql = ", ".join(columns)
    with conn.cursor() as cur:
        cur.execute(f"TRUNCATE TABLE {table}")
        if rows:
            psycopg2.extras.execute_values(
                cur, f"INSERT INTO {table} ({cols_sql}) VALUES %s", rows
            )
    conn.commit()
    return len(rows)


def upsert_riesgo_regiao(conn, rows: list[dict]) -> int:
    columns = [
        "cluster",
        "municipio",
        "lat",
        "lon",
        "score_riesgo",
        "infra",
        "concentracion",
        "vulnerabilidad",
        "n_usuarios_total",
        "pct_legacy_tech",
        "pct_renta_baja",
        "congestion_media",
        "nivel_riesgo",
        "sin_cobertura",
    ]
    values = [tuple(row[col] for col in columns) for row in rows]
    update_cols = [c for c in columns if c != "cluster"]
    set_clause = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_cols)
    set_clause += ", updated_at = now()"

    sql = (
        f"INSERT INTO riesgo_regiao ({', '.join(columns)}) VALUES %s "
        f"ON CONFLICT (cluster) DO UPDATE SET {set_clause}"
    )
    with conn.cursor() as cur:
        if values:
            psycopg2.extras.execute_values(cur, sql, values)
    conn.commit()
    return len(values)


def count_rows(conn, table: str) -> int:
    with conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        return cur.fetchone()[0]
