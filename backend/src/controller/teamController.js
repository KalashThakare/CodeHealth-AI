import Team from "../database/models/team.js"
import User from "../database/models/User.js"
import crypto from "crypto";
import TeamInvite from "../database/models/teamInvite.js";
import TeamMember from "../database/models/teamMember.js";
import { sendInviteMail } from "../lib/mail/noodemailer.js";
import { generateInviteToken } from "../lib/mail/inviteToken.js";

export const createTeam = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, description } = req.body;

        if (!userId) {
            res.status(404).json({ message: "Unauthorised" });
        }
        if (!name || !description) {
            res.status(404).json({ message: "Body looks empty" });
        }

        const user = await User.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            res.status(400).json({ message: "User not found" });
        }

        const team = await Team.create({
            userId,
            name,
            description
        });

        return res.status(201).json({
            message: "Team created",
            team
        });

    } catch (error) {

        console.error("createTeam error:", error);

        if (error?.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors?.map(e => e.message) || []
            });
        }

        if (error?.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({ message: "Invalid userId" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export const sendInvite = async (req, res) => {
    try {
        const { email, role, teamId } = req.body;

        if (!email || !role || !teamId) {
            return res.status(400).json({ error: "email, role, teamId are required" });
        }

        const { raw, hash } = generateInviteToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invite = await TeamInvite.create({
            teamId,
            email: email.toLowerCase().trim(),
            role,
            tokenHash: hash,
            invitedBy: req.user.id,
            expiresAt,
        });

        const base = process.env.FRONTEND_INVITE_BASE_URL || "http://localhost:3000/invite/accept";
        const inviteLink = `${base}?token=${raw}`;

        await sendInviteMail(email, role, inviteLink);

        res.status(201).json({
            id: invite.id,
            teamId: invite.teamId,
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
            status: "sent",
        });


    } catch (error) {

        res.status(500).json({ message: "send Invite controller error" });
        console.error(error);

    }
}

export const acceptInvite = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) return res.status(400).json({ error: "token is required" });

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const invite = await TeamInvite.findOne({ where: { tokenHash } });

        if (!invite) return res.status(400).json({ error: "Invalid invite" });
        if (invite.revokedAt) return res.status(400).json({ error: "Invite revoked" });
        if (invite.acceptedAt) return res.status(400).json({ error: "Invite already accepted" });
        if (new Date() > invite.expiresAt) return res.status(400).json({ error: "Invite expired" });

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
            return res.status(403).json({ error: "Invite email does not match your account" });
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

        res.json({
            teamId: invite.teamId,
            user: { id: user.id, name: user.name, email: user.email },
            role: member.role,
            status: "accepted",
        });

    } catch (error) {

        res.status(500).json({ message: "accept Invite error" });
        console.error(error);

    }
}
