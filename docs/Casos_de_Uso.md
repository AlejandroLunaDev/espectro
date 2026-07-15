# Casos de Uso (Use Cases)

A continuación se detallan los casos de uso principales para el Gestor Público, diseñados para guiar el desarrollo de las funcionalidades frontend y backend.

---

## CU-01: Consulta de Datos Georreferenciados mediante IA
**Actor Principal:** Gestor Público
**Descripción:** El usuario realiza una consulta en lenguaje natural para obtener cruces de datos entre el dataset Vísent y las fuentes de datos públicos.

**Flujo Principal:**
1. El usuario accede a la pantalla principal de la aplicación.
2. Selecciona la región objetivo en el mapa interactivo (o a través de un menú desplegable).
3. Selecciona los indicadores de interés (Ej: Empleabilidad y Cobertura ERB).
4. El mapa muestra visualizaciones de calor o pines con la concentración poblacional y la cobertura de red.
5. El usuario escribe una pregunta en la barra de *AI Query* (ej. "¿Qué distritos tienen alta densidad poblacional pero baja cobertura 4G y bajo empleo?").
6. El sistema envía un `POST /datos` con el prompt, la región, el indicador y el idioma.
7. El sistema procesa la consulta con IA y devuelve una respuesta estructurada.
8. La interfaz muestra la respuesta en texto claro, citando fuentes de los datos y resaltando métricas clave.

**Flujo Alternativo (Error de IA / Datos insuficientes):**
7a. El sistema no encuentra cruces de datos suficientes para la región seleccionada.
8a. El sistema responde: "No se encontraron datos suficientes en [Región] para la combinación solicitada. Intente ampliar el radio de búsqueda o seleccione otro indicador."

---

## CU-02: Visualización Básica del Dashboard de Indicadores
**Actor Principal:** Analista de Políticas Sociales
**Descripción:** El usuario visualiza de forma directa el cruce de los datos de conectividad con los servicios públicos en el mapa.

**Flujo Principal:**
1. El usuario abre la sección de "Mapa de Servicios".
2. El sistema realiza un `GET /mapa` solicitando los polígonos/marcadores.
3. El usuario activa la capa de **Salud Mental**.
4. El mapa se actualiza mostrando las zonas de atención.
5. El usuario superpone la capa de **Vísent CDRView (Conectividad)**.
6. El sistema resalta zonas donde hay una alta necesidad de salud mental pero nula conectividad de red.
7. El usuario hace clic sobre una zona para ver el desglose detallado (número de habitantes estimados vs. calidad de señal).

---

## CU-03: Exportación de Reporte para Toma de Decisiones (Opcional MVP)
**Actor Principal:** Investigador u Organismo Gubernamental
**Descripción:** Generar un reporte en PDF basado en los descubrimientos del dashboard y las respuestas del agente de IA.

**Flujo Principal:**
1. Tras realizar una o varias consultas (CU-01), el usuario presiona el botón "Exportar Reporte".
2. El sistema compila el mapa actual, las gráficas generadas y la síntesis textual de la IA.
3. El usuario puede agregar un título y notas personales antes de exportar.
4. El sistema descarga un PDF formateado, listo para presentar en reuniones gerenciales.
