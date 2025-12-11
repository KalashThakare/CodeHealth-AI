import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getRecentPreview, getUsage } from "../controller/dashbord.Controller.js";

const router = express.Router();

router.get("/usage",protectRoute, getUsage);
router.get("/recentPreview", protectRoute, getRecentPreview);

export default router;