import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { analyze_repo, fetchAiInsights, getAiInsights, uninitializeRepo } from "../controller/analysisController.js";
import { Analyse_repo, getPrAnalysis } from "../controller/scanController.js";
import { fullRepoAnalysisLimiter } from "../config/rateLimiters.js";
import { checkAnalysisStatus } from "../middleware/checkAnalysisStatus.js";

const router = express.Router();

router.get("/:repoId/full-repo",protectRoute, checkAnalysisStatus, fullRepoAnalysisLimiter, analyze_repo)
router.get("/:repoId/insights", getAiInsights)
router.get("/:repoId/fetchInsights", fetchAiInsights);
router.get("/:repoId/pr",protectRoute ,getPrAnalysis)

router.get("/:repoId/initialize",protectRoute, Analyse_repo)
router.post("/:repoId/uninitialize",protectRoute, checkAnalysisStatus, uninitializeRepo)

export default router;