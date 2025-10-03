import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { Analyse_repo, collectPushMetrics, enqueueBatch, getFileMetrics } from "../controller/analysis.Controller.js";

const router = express.Router();

router.post("/full-repo", protectRoute, Analyse_repo);
router.post("/enqueue-batch", enqueueBatch);
router.post("/pushMetric", collectPushMetrics);

router.post("/getmetrics",getFileMetrics)

export default router;