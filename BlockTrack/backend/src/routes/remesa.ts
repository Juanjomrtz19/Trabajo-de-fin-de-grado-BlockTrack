import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as remesaController from "../controllers/remesa";

const router = Router();

router.post("/", authenticate, remesaController.crearRemesa);
router.put("/:idRemesa", authenticate, remesaController.editarRemesa);
router.patch(
  "/cancelarRemesa/:idRemesa",
  authenticate,
  remesaController.cancelarRemesa
);

export default router;
