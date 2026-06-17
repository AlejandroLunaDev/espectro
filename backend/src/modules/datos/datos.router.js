import { Router } from 'express';
import { postDatos } from './datos.controller.js';

const datosRouter = Router();

datosRouter.post('/', postDatos);

export { datosRouter };
