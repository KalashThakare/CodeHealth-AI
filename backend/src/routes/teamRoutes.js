import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createTeam, sendInvite } from "../controller/teamController.js";
import { canInvite } from "../middleware/invitePermission.js";

const router = express.Router();

router.post("/create-team",protectRoute,createTeam);
router.post(
  "/teams/:teamId/invites",
  protectRoute,
  canInvite,
  sendInvite
);
// router.get(
//   "/teams/:teamId/invites",
//   protectRoute,
//   canInvite,
//   listInvites
// );

export default router;