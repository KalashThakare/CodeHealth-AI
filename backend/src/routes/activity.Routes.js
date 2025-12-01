import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getActivity } from "../controller/activity.Controller.js";

const router = express.Router()

router.get("/get", protectRoute, getActivity);

export default router;