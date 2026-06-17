import { Router } from 'express';
import { datosRouter } from '../modules/datos/datos.router.js';

const router = Router();

router.use('/datos', datosRouter);

export { router };
