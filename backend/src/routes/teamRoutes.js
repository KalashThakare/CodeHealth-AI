import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createTeam } from "../controller/teamController.js";

const router = express.Router();

router.post("/create-team",protectRoute,createTeam);

export default router;