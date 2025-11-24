import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsage } from "../controller/dashbord.Controller.js";

const router = express.Router();

router.get("/usage",protectRoute, getUsage);

export default router;