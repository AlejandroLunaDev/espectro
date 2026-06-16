from pathlib import Path

import pandas as pd

from loaders import _fix_cluster_names

CHUNK_SIZE = 500_000
LEGACY_RAT_TYPES = ("LTE", "WCDMA")


def compute_pct_legacy_tech_by_cluster(data_dir: Path) -> dict[str, float]:
    """tensor_mobilidade.csv tiene ~12M filas / ~2.7GB: nunca se carga entero en
    memoria ni se inserta en Postgres (fuera de alcance segun el doc de
    arquitectura). Solo se lee en chunks para acumular sesiones legacy vs total
    por cluster; el ratio final se calcula una vez terminada la lectura."""
    path = data_dir / "tensor_mobilidade.csv"
    totals: dict[str, dict[str, int]] = {}

    reader = pd.read_csv(
        path,
        usecols=["cluster", "rat_type", "n_sessoes"],
        dtype={"cluster": str, "rat_type": str, "n_sessoes": "int32"},
        chunksize=CHUNK_SIZE,
    )
    for chunk in reader:
        chunk["cluster"] = _fix_cluster_names(chunk["cluster"])
        grouped = chunk.groupby("cluster")["n_sessoes"].sum()
        legacy_mask = chunk["rat_type"].isin(LEGACY_RAT_TYPES)
        grouped_legacy = chunk[legacy_mask].groupby("cluster")["n_sessoes"].sum()

        for cluster, total in grouped.items():
            bucket = totals.setdefault(cluster, {"legacy": 0, "total": 0})
            bucket["total"] += int(total)
        for cluster, legacy in grouped_legacy.items():
            bucket = totals.setdefault(cluster, {"legacy": 0, "total": 0})
            bucket["legacy"] += int(legacy)

    return {
        cluster: (bucket["legacy"] / bucket["total"] if bucket["total"] else 0.0)
        for cluster, bucket in totals.items()
    }
