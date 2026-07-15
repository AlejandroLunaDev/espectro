# Contexto de Datos: Dataset Vísent CDRView

El núcleo analítico de la plataforma BiT es el cruce de datos geográficos de conectividad y movilidad con indicadores sociales públicos.

## Dataset Principal: Vísent CDRView
*Repositorio oficial:* `github.com/wongola-bit/appbit-hackathon`

### Descripción
Este dataset proporciona métricas críticas para entender el comportamiento territorial y la brecha digital:
- **Concentración de personas por zona:** Permite ver densidades poblacionales reales en momentos específicos (ej. horario laboral).
- **Cobertura de red ERB (5G/4G/3G):** Provee datos de infraestructura de red usando coordenadas reales de antenas (Anatel, con emulación).

### Preguntas Clave que Responde
1. ¿Dónde hay alta concentración de personas pero infraestructura de red precaria?
2. ¿Qué regiones tienen gran volumen de personas en horario laboral, pero registran bajo empleo formal en bases de datos públicas?
3. ¿Dónde es urgente invertir en conectividad antes de desplegar programas sociales de inclusión digital, educación a distancia o telemedicina?

## Fuentes Públicas Complementarias (Opcionales para el MVP)
Para enriquecer la herramienta, el sistema debe estar preparado para ingerir e integrar fuentes como:
- **DATASUS:** Para cruzar salud comunitaria y mental con acceso a servicios digitales.
- **OMS:** Indicadores globales para establecer benchmarks.
- **Bases Regionales (Angola, LATAM):** Datos censales y económicos para expandir el análisis hacia otros mercados en fases posteriores.

## Arquitectura de Datos Esperada
El pipeline de datos debe ser capaz de:
1. Ingerir los CSV/JSON del Vísent CDRView.
2. Limpiar y georeferenciar los registros.
3. Exponer los resultados mediante un API endpoint (`/datos` y `/mapa`) listos para ser consumidos y cruzados por el agente de IA en lenguaje natural.
