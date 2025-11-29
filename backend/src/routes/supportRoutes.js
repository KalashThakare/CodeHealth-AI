import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { createCase, deleteCase } from "../controller/support.Controller.js";

const router = express.Router()

router.post("/newcase", protectRoute, createCase)
router.delete("/:caseId/deletecase", protectRoute, deleteCase)

export default router;