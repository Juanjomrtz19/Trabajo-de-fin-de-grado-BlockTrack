import { Router } from "express";
import * as userController from "../controllers/user";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);

router.get("/me", authenticate, userController.getCurrentUser);

router.put("/updateUser", authenticate, userController.updateUser);

export default router;
