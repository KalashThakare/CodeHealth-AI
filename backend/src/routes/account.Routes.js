import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteAccount } from "../controller/account.Controller.js";

const router = express.Router();

router.get("/delete",protectRoute,deleteAccount);

export default router;