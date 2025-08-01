import express from "express";
import { githubLogin, googleLogin, googleAuthCallback, githubAuthCallback } from "../controller/auth.Controller.js";

const router = express.Router();

router.get("/google",googleLogin);
router.get("/google/callback",googleAuthCallback);

router.get("/github",githubLogin);
router.get("/github/callback",githubAuthCallback);

export default router;