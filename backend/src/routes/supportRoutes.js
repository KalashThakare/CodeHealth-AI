import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { createCase, deleteCase, getCases } from "../controller/support.Controller.js";

const router = express.Router()

router.post("/cases", protectRoute, createCase)
router.delete("/cases/:caseId", protectRoute, deleteCase)
router.get("/cases", protectRoute, getCases);

export default router;