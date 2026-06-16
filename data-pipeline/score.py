"""Funciones puras del score de riesgo de exclusion digital por cluster.

Sin pandas ni objetos de DB: solo floats/ints in, floats/str out, para que
sean testeables sin fixtures de datos ni conexion.
"""

PESO_INFRA = 0.45
PESO_CONCENTRACION = 0.25
PESO_VULNERABILIDAD = 0.30

# Umbrales no definidos en la documentacion fuente (ARQUITECTURA_DATOS_IA.md
# trata los pesos 0.45/0.25/0.30 como punto de partida documentado, no ley
# fija); estos cortes son el mismo tipo de default ajustable.
UMBRAL_ALTO = 0.66
UMBRAL_MEDIO = 0.33


def compute_infra(congestion: float, drop: float, pct_legacy_tech: float) -> float:
    return (congestion + drop + pct_legacy_tech) / 3


def compute_concentracion(n_usuarios_cluster: float, max_n_usuarios: float) -> float:
    if max_n_usuarios == 0:
        return 0.0
    return n_usuarios_cluster / max_n_usuarios


def compute_vulnerabilidad(count_cd: float, count_total: float) -> float:
    if count_total == 0:
        return 0.0
    return count_cd / count_total


def compute_score(infra: float, concentracion: float, vulnerabilidad: float) -> float:
    return (
        PESO_INFRA * infra
        + PESO_CONCENTRACION * concentracion
        + PESO_VULNERABILIDAD * vulnerabilidad
    )


def nivel_riesgo(score: float) -> str:
    if score >= UMBRAL_ALTO:
        return "ALTO"
    if score >= UMBRAL_MEDIO:
        return "MEDIO"
    return "BAJO"
