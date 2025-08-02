import express from "express";
import { githubLogin, googleLogin, googleAuthCallback, githubAuthCallback, logout, checkAuth } from "../controller/auth.Controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/google",googleLogin);
router.get("/google/callback",googleAuthCallback);

router.get("/github",githubLogin);
router.get("/github/callback",githubAuthCallback);

router.post("/logout",logout);

router.get("/check",protectRoute,checkAuth);

export default router;