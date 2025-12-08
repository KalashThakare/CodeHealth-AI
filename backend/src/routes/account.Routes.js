import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addAlternateEmail, addPhoneNumber, deleteAccount, updateName } from "../controller/account.Controller.js";

const router = express.Router();

router.patch("/add-email", protectRoute, addAlternateEmail);
router.patch("/add-number", protectRoute, addPhoneNumber)
router.patch("/update-name",protectRoute, updateName);
router.delete("/delete",protectRoute,deleteAccount);

export default router;