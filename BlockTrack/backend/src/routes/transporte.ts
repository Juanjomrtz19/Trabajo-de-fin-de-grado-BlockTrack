import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as transporteController from "../controllers/transporte";

const router = Router();

router.post("/", authenticate, transporteController.crearTransporte);
router.get("/", authenticate, transporteController.getAll);
router.put("/:id", authenticate, transporteController.updateTransporte);
router.delete("/:id", authenticate, transporteController.deleteTransporte);

export default router;
