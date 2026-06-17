import { z } from 'zod';
import { BadRequestError } from '../../utils/errors.js';
import { responderConsulta } from './datos.service.js';

const consultaSchema = z.object({
  pregunta: z.string().trim().min(3, 'La pregunta debe tener al menos 3 caracteres').max(1000),
});

export async function postDatos(req, res, next) {
  try {
    const parsed = consultaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? 'Cuerpo invalido');
    }

    const resultado = await responderConsulta(parsed.data.pregunta);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
