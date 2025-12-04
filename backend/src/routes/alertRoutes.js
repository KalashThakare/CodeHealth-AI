import express from "express";
import { createAlert, deleteAlert, getAlert, modifyAlert, toggleAlert } from "../controller/alertController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createAlert)
router.patch("/update", protectRoute, modifyAlert)
router.patch("/toggle", protectRoute, toggleAlert)
router.get("/:repoId/get", protectRoute, getAlert)
router.delete("/delete", protectRoute, deleteAlert)

export default router;