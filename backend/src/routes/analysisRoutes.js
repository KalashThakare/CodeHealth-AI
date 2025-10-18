import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { analyze_repo, fetchAiInsights, getAiInsights } from "../controller/analysisController.js";

const router = express.Router();

router.get("/:repoId/full-repo",protectRoute, analyze_repo)
router.get("/:repoId/insights", getAiInsights)
router.get("/:repoId/fetchInsights", fetchAiInsights);

export default router;