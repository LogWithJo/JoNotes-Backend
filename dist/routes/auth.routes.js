import { Router } from "express";
import { continueAuth, login, logout, register, } from "../controller/auth.controller.js";
const router = Router();
router.post("/continue", continueAuth);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
export default router;
//# sourceMappingURL=auth.routes.js.map