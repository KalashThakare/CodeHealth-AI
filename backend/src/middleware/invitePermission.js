import TeamMember from "../database/models/teamMember.js";

export const canInvite = async (req, res, next) => {
  try {

    const teamId = req.params.teamId || req.body.teamId;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!teamId) {
      return res.status(400).json({ message: "teamId is required" });
    }

    const member = await TeamMember.findOne({
      where: { teamId, userId: req.user.id },
      attributes: ["id", "role"],
    });

    if (!member) {
      return res.status(403).json({ message: "Not a team member" });
    }

    if (!["Owner", "Manager"].includes(member.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.teamMembership = member;
    next();
  } catch (error) {
    console.error("Permission check error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
