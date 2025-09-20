import Team from "../database/models/team.js";
import TeamInvite from "../database/models/teamInvite.js";
import TeamMember from "../database/models/teamMember.js";
import User from "../database/models/User.js";
import { sendInviteMail } from "../lib/mail/noodemailer.js";
import crypto from "crypto";
import { Op } from "sequelize";


// FIX: Add associations if they don't exist
TeamInvite.belongsTo(Team, { foreignKey: "teamId" });
TeamInvite.belongsTo(User, { foreignKey: "invitedBy", as: "InvitedByUser" });

export function generateInviteToken() {
  const raw = crypto.randomBytes(32).toString("base64url");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export const sendInvite = async (req, res) => {
  try {
    const { email, role, teamId } = req.body;

    if (!email || !role || !teamId) {
      return res
        .status(400)
        .json({ error: "email, role, teamId are required" });
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      const existingMember = await TeamMember.findOne({
        where: { teamId, userId: existingUser.id },
      });
      if (existingMember) {
        return res.status(400).json({ error: "User is already a team member" });
      }
    }

    const existingInvite = await TeamInvite.findOne({
      where: {
        teamId,
        email: email.toLowerCase().trim(),
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ error: "Invite already sent to this email" });
    }
  } catch (error) {
    console.error("sendInvite error:", error);
    return res.status(500).json({ message: "Send invite controller error" });
  }
};

export const listTeamInvites = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) return res.status(400).json({ error: "teamId is required" });

    const membership = await TeamMember.findOne({
      where: { teamId, userId: req.user.id },
      attributes: ["role"],
    });
    if (!membership)
      return res.status(403).json({ error: "Not a team member" });
    const allowedRoles = ["Owner", "Manager"]; 
    if (!allowedRoles.includes(membership.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(req.query.pageSize || "20", 10), 1),
      100
    );
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const statusQ = (req.query.status || "all").toLowerCase();
    const q = (req.query.q || "").trim();
    const orderBy = req.query.orderBy || "createdAt";
    const orderDir =
      (req.query.orderDir || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sortable = new Set([
      "createdAt",
      "updatedAt",
      "expiresAt",
      "email",
      "role",
    ]);
    const orderColumn = sortable.has(orderBy) ? orderBy : "createdAt";

    const where = { teamId };

    if (q) {
      where.email = { [Op.iLike]: `%${q}%` };
    }

    const now = new Date();
    if (statusQ !== "all") {
      if (statusQ === "pending") {
        where.acceptedAt = { [Op.is]: null };
        where.revokedAt = { [Op.is]: null };
        where.expiresAt = { [Op.gt]: now };
      } else if (statusQ === "accepted") {
        where.acceptedAt = { [Op.not]: null };
      } else if (statusQ === "revoked") {
        where.revokedAt = { [Op.not]: null };
      } else if (statusQ === "expired") {
        where.acceptedAt = { [Op.is]: null };
        where.revokedAt = { [Op.is]: null };
        where.expiresAt = { [Op.lte]: now };
      } else {
        return res.status(400).json({ error: "Invalid status" });
      }
    }

    const { count, rows } = await TeamInvite.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderColumn, orderDir]],
      include: [
        {
          model: Team,
          attributes: ["id", "name"],
          required: false, 
        },
      ],
    });

    const items = rows.map((inv) => {
      const nowL = new Date();
      let computedStatus = "pending";
      if (inv.revokedAt) computedStatus = "revoked";
      else if (inv.acceptedAt) computedStatus = "accepted";
      else if (nowL > inv.expiresAt) computedStatus = "expired";
      return {
        id: inv.id,
        teamId: inv.teamId,
        team: inv.Team ? { id: inv.Team.id, name: inv.Team.name } : null,
        email: inv.email,
        role: inv.role,
        invitedBy: inv.invitedBy,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        revokedAt: inv.revokedAt,
        status: computedStatus,
      };
    });

    return res.status(200).json({
      page,
      pageSize,
      total: count,
      invites: items,
    });
  } catch (error) {
    console.error("listTeamInvites error:", error);
    return res.status(500).json({ message: "List team invites error" });
  }
};

export const listMyInvites = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(req.query.pageSize || "20", 10), 1),
      100
    );
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const statusQ = (req.query.status || "pending").toLowerCase();
    const orderBy = req.query.orderBy || "createdAt";
    const orderDir =
      (req.query.orderDir || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sortable = new Set(["createdAt", "expiresAt", "email", "role"]);
    const orderColumn = sortable.has(orderBy) ? orderBy : "createdAt";

    const me = await User.findByPk(req.user.id, {
      attributes: ["id", "email"],
    });
    if (!me?.email) return res.status(404).json({ error: "User not found" });

    const where = { email: me.email.toLowerCase().trim() };

    const now = new Date();
    if (statusQ !== "all") {
      if (statusQ === "pending") {
        where.acceptedAt = { [Op.is]: null };
        where.revokedAt = { [Op.is]: null };
        where.expiresAt = { [Op.gt]: now };
      } else if (statusQ === "expired") {
        where.acceptedAt = { [Op.is]: null };
        where.revokedAt = { [Op.is]: null };
        where.expiresAt = { [Op.lte]: now };
      } else if (statusQ === "revoked") {
        where.revokedAt = { [Op.not]: null };
      } else if (statusQ === "accepted") {
        where.acceptedAt = { [Op.not]: null };
      } else {
        return res.status(400).json({ error: "Invalid status" });
      }
    }

    const { count, rows } = await TeamInvite.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderColumn, orderDir]],
      include: [
        {
          model: Team,
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    const items = rows.map((inv) => {
      const nowL = new Date();
      let computedStatus = "pending";
      if (inv.revokedAt) computedStatus = "revoked";
      else if (inv.acceptedAt) computedStatus = "accepted";
      else if (nowL > inv.expiresAt) computedStatus = "expired";
      return {
        id: inv.id,
        teamId: inv.teamId,
        team: inv.Team ? { id: inv.Team.id, name: inv.Team.name } : null,
        email: inv.email,
        role: inv.role,
        invitedBy: inv.invitedBy,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        revokedAt: inv.revokedAt,
        status: computedStatus,
      };
    });

    return res.status(200).json({
      page,
      pageSize,
      total: count,
      invites: items, 
    });
  } catch (error) {
    console.error("listMyInvites error:", error);
    return res.status(500).json({ message: "List received invites error" });
  }
};

export const deleteTeamInvite = async (req, res) => {
  try {
    const { teamId, inviteId } = req.params;
    if (!teamId || !inviteId) {
      return res
        .status(400)
        .json({ error: "teamId and inviteId are required" });
    }

    const membership = await TeamMember.findOne({
      where: { teamId, userId: req.user.id },
      attributes: ["role"],
    });
    if (!membership)
      return res.status(403).json({ error: "Not a team member" });

    const allowed = ["Owner", "Manager"]; 
    if (!allowed.includes(membership.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const invite = await TeamInvite.findOne({
      where: { id: inviteId, teamId },
    });
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    await invite.destroy();

    return res.status(204).send();
  } catch (error) {
    console.error("deleteTeamInvite error:", error);
    return res.status(500).json({ message: "Delete team invite error" });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "token is required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const invite = await TeamInvite.findOne({ where: { tokenHash } });

    if (!invite) return res.status(400).json({ error: "Invalid invite" });
    if (invite.revokedAt)
      return res.status(400).json({ error: "Invite revoked" });
    if (invite.acceptedAt)
      return res.status(400).json({ error: "Invite already accepted" });
    if (new Date() > invite.expiresAt)
      return res.status(400).json({ error: "Invite expired" });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return res
        .status(403)
        .json({ error: "Invite email does not match your account" });
    }

    const [member, created] = await TeamMember.findOrCreate({
      where: { userId: user.id, teamId: invite.teamId },
      defaults: { role: invite.role },
    });

    if (!created) {
      member.role = invite.role;
      await member.save();
    }

    invite.acceptedAt = new Date();
    await invite.save();

    return res.status(200).json({
      message: "Invite accepted successfully",
      teamId: invite.teamId,
      user: { id: user.id, name: user.name, email: user.email },
      role: member.role,
      status: "accepted",
    });
  } catch (error) {
    console.error("acceptInvite error:", error);
    return res.status(500).json({ message: "Accept invite error" });
  }
};

export const declineInvite = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "token is required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const invite = await TeamInvite.findOne({ where: { tokenHash } });
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    const user = await User.findByPk(req.user.id, { attributes: ["email"] });
    if (!user?.email) return res.status(404).json({ error: "User not found" });
    const emailMatches =
      user.email.toLowerCase().trim() === invite.email.toLowerCase().trim();
    if (!emailMatches) {
      return res
        .status(403)
        .json({ error: "Invite email does not match your account" });
    }

    await invite.destroy();

    return res.status(204).send();
  } catch (error) {
    console.error("declineInvite error:", error);
    return res.status(500).json({ message: "Decline invite error" });
  }
};
