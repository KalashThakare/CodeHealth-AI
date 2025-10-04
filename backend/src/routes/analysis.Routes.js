import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { Analyse_repo, collectePythonMetrics, collectPushMetrics, enqueueBatch, getCommitAnalysis, getCommitMetadata, getFileMetrics, getPushMetrics, getRepoMetadata } from "../controller/analysis.Controller.js";

const router = express.Router();

router.post("/full-repo", protectRoute, Analyse_repo);
router.post("/enqueue-batch", enqueueBatch);
router.post("/pushMetric", collectPushMetrics);
router.post("/python-batch",collectePythonMetrics);

router.post("/getfilemetrics",getFileMetrics);
router.post("/getpushmetrics",getPushMetrics);
router.post("/getCommits",getCommitMetadata);
router.post("/commits-analysis",getCommitAnalysis);
router.post("/repo-metadata",getRepoMetadata);


export default router;