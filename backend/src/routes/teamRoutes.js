import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptInvite, createTeam, listTeamMembers, sendInvite, updateRole } from "../controller/teamController.js";
import { canInvite } from "../middleware/invitePermission.js";

const router = express.Router();

router.post("/create-team",protectRoute,createTeam);

router.post(
  "/teams/:teamId/invites",
  protectRoute,
  canInvite,
  sendInvite
);

router.post(
  "/invites/accept", 
  protectRoute,
  acceptInvite
);

router.get(
  "/teams/:teamId/members",
  protectRoute,
  listTeamMembers
);

router.patch(
  "/teams/:teamId/members/:memberId/role",
  protectRoute, 
  updateRole
)

export default router;