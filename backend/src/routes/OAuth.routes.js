import express from "express";
import { githubLogin, googleLogin } from "../controller/auth.Controller.js";

const router = express.Router();

router.get("/google",googleLogin);

router.get("/github",githubLogin);

export default router;