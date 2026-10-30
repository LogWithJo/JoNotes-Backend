import { Router } from "express";
import { continueAuth, login, logout, register, } from "../controller/auth.controller.js";
import { handleGitHubCallback, handleGoogleCallback, redirectToGitHub, redirectToGoogle, } from "../controller/oauth.controller.js";
const router = Router();
router.post("/continue", continueAuth);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback);
router.get("/github", redirectToGitHub);
router.get("/github/callback", handleGitHubCallback);
export default router;
//# sourceMappingURL=auth.routes.js.map