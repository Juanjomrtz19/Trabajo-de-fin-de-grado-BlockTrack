import { Router } from "express";
import * as userController from "../controllers/user";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/me", authenticate, userController.getCurrentUser);

export default router;
