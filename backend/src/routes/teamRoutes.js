import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptInvite, createTeam, deleteTeam, listMyTeams, listTeamMembers, sendInvite, updateRole } from "../controller/teamController.js";
import { canInvite } from "../middleware/invitePermission.js";

const router = express.Router();

router.post("/create-team",protectRoute,createTeam);

router.get("/my/teams", protectRoute, listMyTeams);

router.post(
  "/:teamId/invites",
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
  "/:teamId/members",
  protectRoute,
  listTeamMembers
);

router.patch(
  "/:teamId/members/:memberId/role",
  protectRoute, 
  updateRole
)

router.delete(
  "/:teamId", 
  protectRoute, 
  deleteTeam
);

export default router;