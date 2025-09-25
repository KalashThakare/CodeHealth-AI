import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createTeam,
  deleteTeam,
  leaveTeam,
  listMyTeams,
  listTeamMembers,
  removeMember,
  updateRole,
} from "../controller/teamController.js";
import { canInvite } from "../middleware/invitePermission.js";
import {
  acceptInvite,
  declineInvite,
  deleteTeamInvite,
  listMyInvites,
  listTeamInvites,
  sendInvite,
} from "../controller/invite.Controller.js";

const router = express.Router();

router.post("/create-team", protectRoute, createTeam);
router.get("/my/teams", protectRoute, listMyTeams);
router.get("/:teamId/members", protectRoute, listTeamMembers);

router.get("/invites", protectRoute, listMyInvites);

router.post("/:teamId/invites", protectRoute, canInvite, sendInvite);
router.post("/invites/accept", protectRoute, acceptInvite);
router.post("/invites/decline", protectRoute, declineInvite);

router.get("/:teamId/invites", protectRoute, listTeamInvites);
router.get("/invites/received", protectRoute, listMyInvites);
router.delete("/:teamId/invites/:inviteId", protectRoute, deleteTeamInvite);

router.patch("/:teamId/members/:memberId/role", protectRoute, updateRole);
router.delete("/:teamId/leave", protectRoute, leaveTeam);
router.delete("/:teamId", protectRoute, deleteTeam);
router.delete("/:teamId/members/:memberId", protectRoute, removeMember);

export default router;
