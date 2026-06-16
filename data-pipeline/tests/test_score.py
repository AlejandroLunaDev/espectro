import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from score import (
    PESO_CONCENTRACION,
    PESO_INFRA,
    PESO_VULNERABILIDAD,
    compute_concentracion,
    compute_infra,
    compute_score,
    compute_vulnerabilidad,
    nivel_riesgo,
)


def test_compute_infra_averages_three_components():
    assert compute_infra(0.3, 0.6, 0.0) == 0.3


def test_compute_infra_all_max():
    assert compute_infra(1.0, 1.0, 1.0) == 1.0


def test_compute_concentracion_basic_ratio():
    assert compute_concentracion(50, 200) == 0.25


def test_compute_concentracion_max_cluster_is_one():
    assert compute_concentracion(200, 200) == 1.0


def test_compute_concentracion_handles_zero_max():
    assert compute_concentracion(0, 0) == 0.0


def test_compute_vulnerabilidad_basic_ratio():
    assert compute_vulnerabilidad(30, 100) == 0.3


def test_compute_vulnerabilidad_handles_zero_total():
    assert compute_vulnerabilidad(0, 0) == 0.0


def test_compute_score_weights_sum_to_components():
    infra, concentracion, vulnerabilidad = 0.4, 0.6, 0.8
    expected = (
        PESO_INFRA * infra
        + PESO_CONCENTRACION * concentracion
        + PESO_VULNERABILIDAD * vulnerabilidad
    )
    assert compute_score(infra, concentracion, vulnerabilidad) == expected


def test_compute_score_weights_sum_to_one():
    assert round(PESO_INFRA + PESO_CONCENTRACION + PESO_VULNERABILIDAD, 10) == 1.0


def test_compute_score_all_ones_equals_one():
    assert compute_score(1.0, 1.0, 1.0) == 1.0


def test_compute_score_all_zeros_equals_zero():
    assert compute_score(0.0, 0.0, 0.0) == 0.0


def test_nivel_riesgo_alto_at_threshold():
    assert nivel_riesgo(0.66) == "ALTO"


def test_nivel_riesgo_alto_above_threshold():
    assert nivel_riesgo(0.9) == "ALTO"


def test_nivel_riesgo_medio_at_threshold():
    assert nivel_riesgo(0.33) == "MEDIO"


def test_nivel_riesgo_medio_just_below_alto():
    assert nivel_riesgo(0.659999) == "MEDIO"


def test_nivel_riesgo_bajo_below_medio_threshold():
    assert nivel_riesgo(0.329999) == "BAJO"


def test_nivel_riesgo_bajo_at_zero():
    assert nivel_riesgo(0.0) == "BAJO"
