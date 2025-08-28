import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as transportistaController from "../controllers/transportista";
import * as llevaController from "../controllers/lleva";

const router = Router();

router.patch("/aceptarLleva", authenticate, llevaController.aceptarLLeva);
router.patch("/darDeBaja", authenticate, transportistaController.darDeBaja);
router.get(
  "/llevas",
  authenticate,
  llevaController.obtenerLlevasPorTransportista
);

export default router;
