from pathlib import Path

import pandas as pd

from db import truncate_and_bulk_insert

# El dataset fuente es inconsistente: antenas_flp.csv y tensor_concentracao.csv
# usan "SAO_JOSE_ROÇADO" (con cedilla) para la misma zona que assinantes.csv
# y la tabla clusters (seed del Technical Reference) llaman "SAO_JOSE_ROCADO".
# Sin normalizar, esas filas violan la FK contra clusters y se pierden del join.
CLUSTER_NAME_FIXES = {"SAO_JOSE_ROÇADO": "SAO_JOSE_ROCADO"}


def _fix_cluster_names(series):
    return series.replace(CLUSTER_NAME_FIXES)


ANTENAS_COLUMNS = ["ecgi", "cluster", "municipio", "lat", "lon"]
ASSINANTES_COLUMNS = [
    "assinante_hash",
    "home_cluster",
    "home_municipio",
    "income_cluster",
    "age_group",
    "mobility_pattern",
    "flag_flagship",
]
TENSOR_CONCENTRACAO_COLUMNS = [
    "ecgi",
    "cluster",
    "municipio",
    "day_date",
    "periodo",
    "n_usuarios",
    "n_sessoes",
    "download_bytes",
    "upload_bytes",
    "dur_media_s",
    "drop_pct_medio",
    "congestionamento_medio",
    "chamadas_total",
    "mensagens_total",
    "lat",
    "lon",
]


def load_antenas_flp(conn, data_dir: Path) -> int:
    df = pd.read_csv(
        data_dir / "antenas_flp.csv",
        dtype={"ecgi": str, "cluster": str, "municipio": str},
    )
    df["cluster"] = _fix_cluster_names(df["cluster"])
    rows = list(df[ANTENAS_COLUMNS].itertuples(index=False, name=None))
    return truncate_and_bulk_insert(conn, "antenas_flp", ANTENAS_COLUMNS, rows)


def load_assinantes(conn, data_dir: Path) -> int:
    df = pd.read_csv(
        data_dir / "assinantes.csv",
        dtype={
            "assinante_hash": "int32",
            "home_cluster": str,
            "home_municipio": str,
            "income_cluster": str,
            "age_group": str,
            "mobility_pattern": str,
            "flag_flagship": "int8",
        },
    )
    rows = list(df[ASSINANTES_COLUMNS].itertuples(index=False, name=None))
    return truncate_and_bulk_insert(conn, "assinantes", ASSINANTES_COLUMNS, rows)


def load_tensor_concentracao(conn, data_dir: Path) -> int:
    df = pd.read_csv(
        data_dir / "tensor_concentracao.csv",
        dtype={"ecgi": str, "cluster": str, "municipio": str, "periodo": str},
        parse_dates=["day_date"],
    )
    df["day_date"] = df["day_date"].dt.date
    df["cluster"] = _fix_cluster_names(df["cluster"])
    rows = list(df[TENSOR_CONCENTRACAO_COLUMNS].itertuples(index=False, name=None))
    return truncate_and_bulk_insert(
        conn, "tensor_concentracao", TENSOR_CONCENTRACAO_COLUMNS, rows
    )


def read_assinantes_df(data_dir: Path) -> pd.DataFrame:
    return pd.read_csv(
        data_dir / "assinantes.csv",
        dtype={"home_cluster": str, "income_cluster": str},
    )


def read_tensor_concentracao_df(data_dir: Path) -> pd.DataFrame:
    df = pd.read_csv(
        data_dir / "tensor_concentracao.csv",
        dtype={"ecgi": str, "cluster": str},
    )
    df["cluster"] = _fix_cluster_names(df["cluster"])
    return df
