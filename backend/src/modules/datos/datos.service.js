import { query } from '../../lib/pg.js';
import { embedText, chatCompletion } from '../../lib/openrouter.js';

const TOP_DOCS = 4;

// "BiT" consultant persona, condensed from docs/Prompt_IA.md. The hard rule is
// anti-hallucination: answer only from the data the system provides.
const SYSTEM_PROMPT = [
  'Eres "BiT", un consultor experto en analisis de datos geoespaciales y politicas publicas para gestores gubernamentales.',
  'Tu mision: ayudar a decidir donde priorizar inversion en inclusion digital, cruzando infraestructura de red, concentracion de personas y vulnerabilidad socioeconomica.',
  'REGLAS:',
  '1. BASADO EN EVIDENCIA: responde EXCLUSIVAMENTE con los datos del contexto que te paso el sistema. Si no hay datos suficientes, dilo. NUNCA inventes cifras ni regiones.',
  '2. ENFOQUE A LA ACCION: no solo describas numeros; explica el "por que" e incluye una sugerencia estrategica concreta para el gestor.',
  '3. TONO: profesional, claro y directo; traduce la jerga tecnica a impacto social.',
  '4. FORMATO: usa vinetas o listas cuando ayude a la lectura rapida.',
  '5. Cerra siempre recordando que esto es APOYO A LA DECISION, no decision automatica.',
  'Si la pregunta no es sobre politicas publicas, inclusion digital o analisis territorial, reconduce amablemente la conversacion.',
].join('\n');

async function retrieveContext(pregunta) {
  const embedding = await embedText(pregunta);
  const literal = `[${embedding.join(',')}]`;
  const { rows } = await query(
    `select fuente, seccion, contenido,
            1 - (embedding <=> $1::extensions.vector) as similitud
     from documents_vectors
     order by embedding <=> $1::extensions.vector
     limit $2`,
    [literal, TOP_DOCS],
  );
  return rows;
}

async function getRiesgoData() {
  const { rows } = await query(
    `select cluster, municipio, score_riesgo, nivel_riesgo, infra, concentracion,
            vulnerabilidad, pct_legacy_tech, pct_renta_baja, congestion_media,
            n_usuarios_total, sin_cobertura
     from riesgo_regiao
     order by score_riesgo desc`,
  );
  return rows;
}

function buildUserMessage(pregunta, contexto, regiones) {
  const docs = contexto
    .map((c, i) => `[${i + 1}] (${c.fuente} / ${c.seccion})\n${c.contenido}`)
    .join('\n\n');

  return [
    `PREGUNTA DEL GESTOR:\n${pregunta}`,
    `\nCONTEXTO DOCUMENTAL (metodologia y definiciones, usalo para explicar):\n${docs}`,
    `\nDATOS DE REGIONES (tabla riesgo_regiao, score 0-1 donde 1 = mayor riesgo de exclusion digital):\n${JSON.stringify(regiones)}`,
    '\nResponde la pregunta usando solo estos datos.',
  ].join('\n');
}

export async function responderConsulta(pregunta) {
  const [contexto, regiones] = await Promise.all([retrieveContext(pregunta), getRiesgoData()]);

  const respuesta = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage(pregunta, contexto, regiones) },
  ]);

  return {
    pregunta,
    respuesta,
    fuentes: contexto.map((c) => ({
      fuente: c.fuente,
      seccion: c.seccion,
      similitud: Number(c.similitud.toFixed(3)),
    })),
    regiones_consideradas: regiones.length,
    aviso: 'Apoyo a la decision, no decision automatica.',
  };
}
