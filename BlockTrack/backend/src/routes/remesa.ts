import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as remesaController from "../controllers/remesa";
import * as llevaController from "../controllers/lleva";

const router = Router();

router.get("/:remesaId/llevas", authenticate, llevaController.obtenerLlevas);
router.get("/:idRemesa", authenticate, remesaController.obtenerRemesa);
router.get("/", authenticate, remesaController.obtenerRemesas);
router.post("/", authenticate, remesaController.crearRemesa);
router.put("/:idRemesa", authenticate, remesaController.editarRemesa);
router.patch(
  "/cancelarRemesa/:idRemesa",
  authenticate,
  remesaController.cancelarRemesa
);
router.post(
  "/asignarTransportistas/:idRemesa",
  authenticate,
  remesaController.asignarTransportistas
);
router.post(
  "/actualizarProveedor/:idRemesa",
  authenticate,
  remesaController.cambiarPoseedorRemesa
);

export default router;
