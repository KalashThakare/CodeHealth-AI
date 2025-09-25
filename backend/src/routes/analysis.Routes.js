import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { Analyse_repo } from "../controller/analysis.Controller.js";

const router = express.Router();

router.post("/full-repo", protectRoute, Analyse_repo);

export default router;