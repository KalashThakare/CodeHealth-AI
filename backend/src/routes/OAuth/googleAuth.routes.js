import express from "express";
import { googleLogin } from "../../controller/auth.Controller.js";

const router = express.Router();

router.get("/google",googleLogin);

export default router;