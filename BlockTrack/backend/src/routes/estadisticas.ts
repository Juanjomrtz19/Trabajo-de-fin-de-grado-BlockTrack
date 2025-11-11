import { Router } from "express";
import * as estadisticasController from "../controllers/estadisticas";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/", authenticate, estadisticasController.obtenerEstadisticas);

export default router;
