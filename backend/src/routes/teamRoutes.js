import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptInvite,
  createTeam,
  deleteTeam,
  leaveTeam,
  listMyTeams,
  listTeamMembers,
  removeMember,
  sendInvite,
  updateRole,
} from "../controller/teamController.js";
import { canInvite } from "../middleware/invitePermission.js";

const router = express.Router();

router.post("/create-team", protectRoute, createTeam);
router.get("/my/teams", protectRoute, listMyTeams);
router.get("/:teamId/members", protectRoute, listTeamMembers);

router.post("/:teamId/invites", protectRoute, canInvite, sendInvite);
router.post("/invites/accept", protectRoute, acceptInvite);

router.patch("/:teamId/members/:memberId/role", protectRoute, updateRole);
router.delete("/:teamId/leave", protectRoute, leaveTeam);
router.delete("/:teamId", protectRoute, deleteTeam);
router.delete("/:teamId/members/:memberId", protectRoute, removeMember);

export default router;
