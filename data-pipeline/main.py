from pathlib import Path

import pipeline
from config import CDRVIEW_DATA_DIR
from db import count_rows, get_connection
from loaders import load_antenas_flp, load_assinantes, load_tensor_concentracao


def main() -> None:
    data_dir = Path(CDRVIEW_DATA_DIR).resolve()
    conn = get_connection()
    try:
        clusters_count = count_rows(conn, "clusters")
        if clusters_count == 0:
            raise RuntimeError(
                "La tabla clusters esta vacia. Aplica las migraciones de "
                "Supabase antes de correr el pipeline."
            )

        antenas_count = load_antenas_flp(conn, data_dir)
        assinantes_count = load_assinantes(conn, data_dir)
        tensor_count = load_tensor_concentracao(conn, data_dir)
        scored_count = pipeline.run(conn, data_dir)

        print("Pipeline completado:")
        print(f"  clusters (ya seeded): {clusters_count}")
        print(f"  antenas_flp cargadas: {antenas_count}")
        print(f"  assinantes cargados: {assinantes_count}")
        print(f"  tensor_concentracao cargados: {tensor_count}")
        print(f"  clusters con riesgo calculado: {scored_count}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
