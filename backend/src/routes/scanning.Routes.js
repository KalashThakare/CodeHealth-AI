import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { Analyse_repo, collectePythonMetrics, collectPushMetrics, enqueueBatch, fetchCommitAnalysis, fetchCommits, getCommitAnalysis, getCommitMetadata, getContributers, getFileMetrics, getPushMetrics, getRepoMetadata } from "../controller/scanController.js";

const router = express.Router();

router.post("/full-repo", protectRoute, Analyse_repo);
router.post("/enqueue-batch", enqueueBatch);
router.post("/pushMetric", collectPushMetrics);
router.post("/python-batch",collectePythonMetrics);
router.post("/commits-analysis",getCommitAnalysis);
router.post("/repo-metadata",getRepoMetadata);
router.post("/Commits",getCommitMetadata);
router.post("/contributors", getContributers);

//below are for frontend use
router.get("/:repoId/getfilemetrics",protectRoute, getFileMetrics);
router.get("/:repoId/getpushmetrics",protectRoute, getPushMetrics);
router.get("/:repoId/getCommits", protectRoute, fetchCommits);
router.get("/:repoId/getCommits-analysis", protectRoute, fetchCommitAnalysis);

export default router;