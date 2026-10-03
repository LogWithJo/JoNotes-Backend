import { Router } from "express";
import {
	continueAuth,
	login,
	register,
} from "../controller/auth.controller.js";

const router = Router();

router.post("/continue", continueAuth);
router.post("/register", register);
router.post("/login", login);

export default router;
