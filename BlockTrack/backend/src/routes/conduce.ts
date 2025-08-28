import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as conduceController from "../controllers/conduce";

const router = Router();

router.get("/", authenticate, conduceController.obtenerConduce);
router.post("/", authenticate, conduceController.crearConduce);
router.delete("/", authenticate, conduceController.borrarConduce);

export default router;
