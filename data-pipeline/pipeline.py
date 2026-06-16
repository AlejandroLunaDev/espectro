from pathlib import Path

from db import upsert_riesgo_regiao
from loaders import read_assinantes_df, read_tensor_concentracao_df
from mobilidade import compute_pct_legacy_tech_by_cluster
from score import compute_concentracion, compute_infra, compute_score, compute_vulnerabilidad, nivel_riesgo


def _fetch_clusters_metadata(conn) -> dict[str, dict]:
    with conn.cursor() as cur:
        cur.execute("SELECT cluster, municipio, lat, lon FROM clusters")
        return {
            row[0]: {"municipio": row[1], "lat": row[2], "lon": row[3]}
            for row in cur.fetchall()
        }


def run(conn, data_dir: Path) -> int:
    tensor_df = read_tensor_concentracao_df(data_dir)
    assinantes_df = read_assinantes_df(data_dir)
    pct_legacy_tech_by_cluster = compute_pct_legacy_tech_by_cluster(data_dir)
    clusters_meta = _fetch_clusters_metadata(conn)

    tensor_agg = tensor_df.groupby("cluster").agg(
        congestion=("congestionamento_medio", "mean"),
        drop=("drop_pct_medio", "mean"),
        n_usuarios_total=("n_usuarios", "sum"),
    )
    max_n_usuarios = int(tensor_agg["n_usuarios_total"].max()) if not tensor_agg.empty else 0

    vulnerabilidad_by_cluster = assinantes_df.groupby("home_cluster")["income_cluster"].apply(
        lambda s: compute_vulnerabilidad((s.isin(["C", "D"])).sum(), len(s))
    )
    poblacion_by_cluster = assinantes_df.groupby("home_cluster").size()

    rows = []
    for cluster, meta in clusters_meta.items():
        vulnerabilidad = float(vulnerabilidad_by_cluster.get(cluster, 0.0))
        sin_cobertura = cluster not in tensor_agg.index

        if sin_cobertura:
            # Cero antenas no es "cero riesgo": es la peor senal de exclusion
            # digital posible (ni siquiera medible). infra/concentracion se
            # fuerzan al maximo en vez de promediar datos que no existen; el
            # flag sin_cobertura es lo que le permite a la IA explicar el
            # motivo real en vez de citar componentes inventados.
            infra = 1.0
            concentracion = 1.0
            congestion = 0.0
            pct_legacy_tech = 0.0
            n_usuarios_total = int(poblacion_by_cluster.get(cluster, 0))
        else:
            congestion = float(tensor_agg.loc[cluster, "congestion"])
            drop = float(tensor_agg.loc[cluster, "drop"])
            n_usuarios_total = int(tensor_agg.loc[cluster, "n_usuarios_total"])
            pct_legacy_tech = float(pct_legacy_tech_by_cluster.get(cluster, 0.0))
            infra = compute_infra(congestion, drop, pct_legacy_tech)
            concentracion = compute_concentracion(n_usuarios_total, max_n_usuarios)

        score = compute_score(infra, concentracion, vulnerabilidad)

        rows.append(
            {
                "cluster": cluster,
                "municipio": meta["municipio"],
                "lat": meta["lat"],
                "lon": meta["lon"],
                "score_riesgo": score,
                "infra": infra,
                "concentracion": concentracion,
                "vulnerabilidad": vulnerabilidad,
                "n_usuarios_total": n_usuarios_total,
                "pct_legacy_tech": pct_legacy_tech,
                "pct_renta_baja": vulnerabilidad,
                "congestion_media": congestion,
                "nivel_riesgo": nivel_riesgo(score),
                "sin_cobertura": sin_cobertura,
            }
        )

    return upsert_riesgo_regiao(conn, rows)
