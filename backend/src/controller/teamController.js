import Team from "../database/models/team.js";
import User from "../database/models/User.js";
import TeamInvite from "../database/models/teamInvite.js";
import TeamMember from "../database/models/teamMember.js";
import sequelize from "../database/db.js";

Team.sync();
TeamMember.sync();
TeamInvite.sync();
User.sync();

export const createTeam = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    const { name, description } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    }

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const team = await Team.create(
      {
        userId,
        name,
        description,
      },
      { transaction: t }
    );

    await TeamMember.create(
      { teamId: team.id, userId, role: "Owner" },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      message: "Team created",
      team,
    });
  } catch (error) {
    await t.rollback();
    console.error("createTeam error:", error);

    if (error?.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors?.map((e) => e.message) || [],
      });
    }

    if (error?.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ message: "Invalid userId" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listMyTeams = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    if (!authUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Fetching teams for user:", authUserId);

    const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const { rows, count } = await Team.findAndCountAll({
      where: { userId: authUserId },
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    console.log("Found teams:", rows.length);

    return res.status(200).json({
      message: "Teams fetched successfully",
      userId: authUserId,
      count,
      limit,
      offset,
      teams: rows,
    });
  } catch (err) {
    console.error("listMyTeams error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listTeamMembers = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    if (!teamId) {
      return res.status(400).json({ error: "teamId is required" });
    }

    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email"],
          through: { attributes: ["role"] },
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const members = (team.members || []).map((u) => ({
      id: u.id,
      name: u.name || u.email.split("@")[0],
      email: u.email,
      role: u.TeamMember.role,
    }));

    return res.status(200).json({
      message: "Members fetched successfully",
      members,
    });
  } catch (err) {
    console.error("listTeamMembers error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const authUser = req.user?.id;
    const memberId = req.params.memberId;

    if (!teamId) return res.status(400).json({ message: "teamId is required" });
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });
    if (!memberId)
      return res.status(400).json({ message: "memberId is required" });

    const requester = await TeamMember.findOne({
      where: { teamId, userId: authUser },
      attributes: ["id", "userId", "role"],
    });
    if (!requester)
      return res.status(403).json({ message: "Not a team member" });

    const canManage =
      requester.role === "Owner" || requester.role === "Manager";
    if (!canManage)
      return res.status(403).json({ message: "Insufficient permissions" });

    const target = await TeamMember.findOne({
      where: { teamId, id: memberId },
      attributes: ["id", "userId", "role"],
    });
    if (!target)
      return res.status(404).json({ message: "Target membership not found" });

    if (target.userId === authUser) {
      return res
        .status(400)
        .json({ message: "Use leave endpoint to remove yourself" });
    }

    await TeamMember.destroy({ where: { id: target.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("removeMember error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const memberId = req.params.memberId;
    const { role: newRole } = req.body;
    const authUserId = req.user?.id;

    if (!authUserId) return res.status(401).json({ message: "Unauthorized" });
    if (!teamId) return res.status(400).json({ message: "teamId is required" });
    if (!newRole)
      return res.status(400).json({ message: "No new role provided" });
    if (!memberId)
      return res.status(400).json({ message: "memberId is required" });

    const requesterMembership = await TeamMember.findOne({
      where: { teamId, userId: authUserId },
      attributes: ["id", "role"],
    });
    if (!requesterMembership) {
      return res.status(403).json({ message: "Not a team member" });
    }
    if (requesterMembership.role !== "Owner") {
      return res.status(403).json({ message: "Only Owners can update roles" });
    }

    const targetMembership = await TeamMember.findOne({
      where: { id: memberId, teamId },
      attributes: ["id", "userId", "teamId", "role"],
    });

    if (!targetMembership) {
      return res.status(404).json({ message: "Target membership not found" });
    }

    if (targetMembership.userId === authUserId) {
      return res
        .status(400)
        .json({ message: "Owners cannot change their own role" });
    }

    targetMembership.role = newRole;
    await targetMembership.save();

    return res.status(200).json({
      message: "Role updated successfully",
      id: targetMembership.id,
      teamId: targetMembership.teamId,
      userId: targetMembership.userId,
      role: targetMembership.role,
    });
  } catch (error) {
    console.error("updateRole error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const leaveTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const authUserId = req.user?.id;

    if (!authUserId) return res.status(401).json({ message: "Unauthorized" });
    if (!teamId) return res.status(400).json({ message: "teamId is required" });

    const membership = await TeamMember.findOne({
      where: { teamId, userId: authUserId },
      attributes: ["id", "role", "userId", "teamId"],
    });

    if (!membership) return res.status(404).json({ message: "Not a member" });
    if (membership.role === "Owner")
      return res
        .status(400)
        .json({ message: "Cannot leave, you are the owner" });

    await TeamMember.destroy({ where: { id: membership.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("leaveTeam error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const authUserId = req.user?.id;

    if (!authUserId) return res.status(401).json({ message: "Unauthorized" });
    if (!teamId) return res.status(400).json({ message: "teamId is required" });

    const team = await Team.findOne({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const membership = await TeamMember.findOne({
      where: { teamId, userId: authUserId },
      attributes: ["id", "role", "userId", "teamId"],
    });

    if (!membership)
      return res.status(403).json({ message: "Not a team member" });
    if (membership.role !== "Owner")
      return res.status(403).json({ message: "You don't have permission" });

    await team.destroy();
    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("deleteTeam error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
