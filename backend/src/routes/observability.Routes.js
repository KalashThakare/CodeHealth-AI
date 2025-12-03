import express from "express";
import { getTrendAnalysis, heatMap, prDistribution, prVelocity, pushActivity, reviewerPerformance, stalePRs } from "../controller/observability.Controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:repoId/trend", getTrendAnalysis);

router.get("/:repoId/push-activity", protectRoute, pushActivity);
router.get("/:repoId/activity-heatmap", protectRoute, heatMap);

router.get("/:repoId/pr-velocity", protectRoute, prVelocity);
router.get("/:repoId/stale-prs", protectRoute, stalePRs);
router.get("/:repoId/reviewer-performance", protectRoute, reviewerPerformance);
router.get("/:repoId/pr-distribution", protectRoute, prDistribution)

export default router;