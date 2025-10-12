import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { analyze_repo } from "../controller/analysisController.js";

const router = express.Router();

router.get("/:repoId/full-repo", analyze_repo)

export default router;