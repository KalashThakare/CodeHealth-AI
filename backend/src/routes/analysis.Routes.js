import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { Analyse_repo, collectePythonMetrics, collectPushMetrics, enqueueBatch, getFileMetrics, getPushMetrics } from "../controller/analysis.Controller.js";

const router = express.Router();

router.post("/full-repo", protectRoute, Analyse_repo);
router.post("/enqueue-batch", enqueueBatch);
router.post("/pushMetric", collectPushMetrics);
router.post("/python-batch",collectePythonMetrics);

router.post("/getfilemetrics",protectRoute,getFileMetrics);
router.post("/getpushmetrics",protectRoute,getPushMetrics);

export default router;