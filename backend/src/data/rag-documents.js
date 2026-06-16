// Narrative knowledge base for the RAG layer (documents_vectors).
// These chunks give the AI the context it needs to *explain* the data: what the
// risk score means, what each indicator is, how day-periods map to real life,
// and the privacy rules. They are NOT the data itself — numbers come from SQL.
//
// Chunked by section (not by fixed character size) so each vector covers one
// semantically complete idea, per ARQUITECTURA_DATOS_IA.md section 7.

export const RAG_DOCUMENTS = [
  {
    fuente: 'score_metodologia',
    seccion: '4. Score de riesgo de exclusion digital',
    contenido: [
      'El score de riesgo de exclusion digital mide donde priorizar inversion en inclusion digital.',
      'Es un score COMPUESTO en escala 0 a 1 (1 = peor), porque el problema es social: no alcanza con medir donde la red anda mal, hay que medir donde la red es mala Y afecta a mucha gente vulnerable.',
      'Se calcula combinando tres componentes, todos normalizados a 0-1:',
      '1) Infraestructura (peso 0.45): promedio de congestion de red, tasa de paquetes descartados (drop) y porcentaje de sesiones en tecnologia legacy (3G/WCDMA + 4G/LTE sobre el total). Mucha tecnologia legacy = peor. Es el nucleo de la exclusion digital y lo que el dataset mide mejor.',
      '2) Concentracion de personas (peso 0.25): cantidad de usuarios del cluster dividida por el maximo de usuarios entre todos los clusters. Mide cuanta gente esta expuesta al problema.',
      '3) Vulnerabilidad socioeconomica (peso 0.30): proporcion de habitantes con renta baja (income_cluster C o D) sobre el total del cluster. Es un proxy de renta baja a partir de los datos de Visent.',
      'Formula final: score_riesgo = 0.45 * infra + 0.25 * concentracion + 0.30 * vulnerabilidad.',
      'Los pesos son un punto de arranque ajustable, documentado en la pantalla de metodologia. Vulnerabilidad (0.30) pesa mas que concentracion (0.25) porque el angulo es social: se prefiere senalar una zona vulnerable mediana antes que una rica masiva.',
      'El score es apoyo a la decision, no decision automatica.',
    ].join('\n'),
  },
  {
    fuente: 'score_metodologia',
    seccion: 'Interpretacion de niveles de riesgo y zonas sin cobertura',
    contenido: [
      'El nivel de riesgo clasifica cada region segun su score: ALTO si score_riesgo >= 0.66, MEDIO si >= 0.33, BAJO si es menor. Estos umbrales son un default ajustable.',
      'Cada region guarda sus tres componentes por separado (infra, concentracion, vulnerabilidad) para poder explicar el porque de su prioridad sin recalcular. Por ejemplo: "CAMPECHE es prioritaria por infraestructura mala 0.8, mucha gente 0.6 y alta vulnerabilidad 0.7", en vez de solo "score 0.78".',
      'Algunas zonas no tienen ninguna antena en el dataset (zonas rurales o perifericas). Esto NO significa riesgo cero: es la peor senal de exclusion digital posible, porque no hay ni siquiera infraestructura medible. Estas zonas se marcan con sin_cobertura = true y reciben riesgo maximo (infra y concentracion forzadas al maximo), apareciendo entre las mas prioritarias del mapa.',
    ].join('\n'),
  },
  {
    fuente: 'technical_reference_v2',
    seccion: 'Anexo B - Glosario de terminos',
    contenido: [
      'CDR: Call Detail Record, registro de evento de red generado por la operadora.',
      'IPDR: IP Detail Record, registro de sesion de datos en redes moviles.',
      'ECGI: E-UTRAN Cell Global Identifier, identificador unico de celula (antena). Siempre se trata como string.',
      'ERB: Estacion Radio Base, torre de telecomunicaciones con una o mas celulas.',
      'NR: New Radio, tecnologia 5G. Es la tecnologia mas moderna y de mejor calidad.',
      'LTE: Long Term Evolution, tecnologia 4G.',
      'WCDMA: Wideband CDMA, tecnologia 3G. Es tecnologia legacy: su predominio indica peor infraestructura.',
      'Cluster: zona geografica funcional de la Region Metropolitana (27 zonas, calibradas por poblacion IBGE 2022).',
      'Congestion: nivel de saturacion de la celula, en escala 0 a 1. Mas alto = peor.',
      'Drop (drop_pct): tasa de paquetes descartados, en escala 0 a 1. Mas alto = peor calidad de conexion.',
      'K-anonimato: tecnica de privacidad por la cual cada registro es indistinguible de al menos K-1 otros.',
      'LGPD: Lei Geral de Protecao de Dados (Ley 13.709/2018), regula los datos personales en Brasil.',
      'CDRView: plataforma de analytics de Visent para CDR/IPDR a escala carrier class.',
    ].join('\n'),
  },
  {
    fuente: 'technical_reference_v2',
    seccion: 'Semantica de los periodos del dia',
    contenido: [
      'Los eventos de red se agregan en cuatro periodos del dia. Sirven para mapear consultas en lenguaje natural (ej. "horario laboral") al codigo correcto:',
      'MADRUGADA: de 00h a 06h. Perfil de bajo uso. Aprox 8% de los eventos.',
      'MANHA (manana): de 06h a 12h. Perfil de desplazamiento al trabajo. Aprox 28% de los eventos.',
      'TARDE: de 12h a 18h. Pico de uso. Aprox 35% de los eventos.',
      'NOITE (noche): de 18h a 00h. Perfil de ocio y streaming. Aprox 29% de los eventos.',
      'Cuando el usuario menciona "horario laboral" o "hora pico de trabajo", se refiere principalmente a MANHA y TARDE.',
    ].join('\n'),
  },
  {
    fuente: 'sumario_kanon',
    seccion: 'Privacidad, K-anonimato y LGPD',
    contenido: [
      'El dataset es sintetico y respeta privacidad por diseno. No hay datos reales de ningun abonado: todos los registros son generados por un framework de Visent que reproduce patrones de movilidad reales.',
      'Se aplica K-anonimato con K=3 para el hackathon (K=5 obligatorio en produccion segun LGPD Art. 12). Esto garantiza que cada registro agregado representa al menos K personas, por lo que ningun individuo es identificable.',
      'Reporte de privacidad del dataset: K usado = 3; total de pares origen-destino = 506; pares K-anonimos = 506; cobertura = 100%. Aviso para produccion: aumentar K a 5.',
      'Las antenas provienen de base publica de Anatel (reguladora brasilena), geocodificadas. Cualquier semejanza con datos reales de abonados es coincidencia estadistica del modelo generativo.',
    ].join('\n'),
  },
  {
    fuente: 'mvp_definicion',
    seccion: 'Vision del producto y servicios',
    contenido: [
      'App BiT es una web app B2G (gobierno) que ayuda a gestores publicos a decidir donde invertir primero en inclusion digital. El usuario pregunta en lenguaje natural, el sistema cruza datos territoriales con IA, y devuelve una respuesta con datos, fuentes y recomendacion, destacando la region en un mapa.',
      'Vision: ir mas alla de las estadisticas tradicionales para entender donde, como y por que ocurren las desigualdades territoriales, y actuar con politicas de inclusion antes de que las brechas se profundicen.',
      'El producto contempla cinco areas de servicio: 1) Formaciones (programas de formacion tech vs conectividad), 2) Empleabilidad (concentracion de personas vs empleo formal), 3) Experiencias Estructurantes (iniciativas sociales replicables), 4) Mentorias (conexion sociedad civil con gobierno), 5) Salud Mental (necesidad de apoyo vs conectividad para telemedicina).',
      'Experiencia central: mapa interactivo (Mapbox) mas consulta IA en lenguaje natural.',
    ].join('\n'),
  },
  {
    fuente: 'mvp_definicion',
    seccion: 'Usuarios y dolores que resuelve',
    contenido: [
      'Usuarios principales: gestores publicos, analistas de politicas sociales, investigadores y organismos gubernamentales.',
      'Dolores reales que resuelve: 1) silos de informacion (datos publicos dispersos y dificiles de cruzar), 2) falta de contexto espacial (no hay visualizaciones geograficas de la concentracion de desigualdades), 3) barrera tecnica (dificultad para formular consultas en SQL u otros sistemas), 4) decisiones reactivas o intuitivas por falta de evidencia accesible, 5) ceguera de infraestructura (desconocer donde falta conectividad basica, lo que impide que lleguen los programas sociales).',
    ].join('\n'),
  },
  {
    fuente: 'dataset_contexto',
    seccion: 'Que es el dataset Visent CDRView',
    contenido: [
      'El nucleo analitico de App BiT es el dataset Visent CDRView: metricas de conectividad y movilidad de la Region Metropolitana de Florianopolis.',
      'Provee concentracion de personas por zona (densidades poblacionales reales en momentos especificos del dia) y cobertura de red ERB (5G/4G/3G) usando coordenadas reales de antenas de Anatel.',
      'Preguntas clave que responde: donde hay alta concentracion de personas pero infraestructura de red precaria; que regiones tienen gran volumen de personas en horario laboral; donde es urgente invertir en conectividad antes de desplegar programas de inclusion digital, educacion a distancia o telemedicina.',
    ].join('\n'),
  },
  {
    fuente: 'casos_de_uso',
    seccion: 'Que puede hacer el usuario en la app',
    contenido: [
      'Consulta de datos georreferenciados mediante IA: el gestor selecciona una region e indicadores en el mapa y pregunta en lenguaje natural (ej. "que zonas tienen alta densidad pero baja cobertura 4G"). El sistema responde con texto claro, citando fuentes y resaltando metricas clave.',
      'Visualizacion del mapa de servicios: el usuario activa capas (ej. cobertura de red) y ve zonas resaltadas, con desglose al hacer clic (habitantes estimados vs calidad de senal).',
      'Exportacion de reporte (opcional): compila el mapa, las graficas y la sintesis de la IA en un PDF para presentar en reuniones.',
      'Si no hay datos suficientes para una region o cruce, el sistema lo dice claramente en vez de inventar.',
    ].join('\n'),
  },
  {
    fuente: 'alcance_datos_mvp',
    seccion: 'Alcance de datos del MVP (limite importante)',
    contenido: [
      'IMPORTANTE para no inventar datos: aunque la vision del producto menciona cinco areas (formaciones, empleabilidad, experiencias, mentorias, salud mental), el dataset actual del MVP SOLO contiene datos de red e infraestructura (concentracion de personas, cobertura 3G/4G/5G, congestion, calidad de senal) y un proxy de renta (income_cluster).',
      'NO hay datos reales de empleo, formacion, salud mental ni programas sociales en la base. Esas cinco areas son la vision y el roadmap del producto, no datos disponibles hoy.',
      'Por eso el score de riesgo de exclusion digital se construye unicamente con lo que si esta en el dataset: infraestructura de red, concentracion de personas y vulnerabilidad socioeconomica (renta).',
      'Al responder, la IA debe basarse solo en estos datos disponibles. Si el usuario pregunta por empleo, salud mental o formacion como dato, hay que aclarar que el MVP trabaja con infraestructura y riesgo de exclusion digital, y no afirmar cifras que no existen.',
    ].join('\n'),
  },
];
