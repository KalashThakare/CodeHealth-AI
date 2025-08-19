import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const TeamInvite = sequelize.define("TeamInvite", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  teamId: { type: DataTypes.UUID, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  role: { type: DataTypes.ENUM("Owner","Manager","Member"), allowNull: false, defaultValue: "Member" },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  invitedBy: { type: DataTypes.UUID, allowNull: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  acceptedAt: { type: DataTypes.DATE, allowNull: true },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: "team_invites",
  timestamps: true,
  indexes: [
    { fields: ["teamId"] },
    { unique: true, fields: ["teamId", "email"], where: { revokedAt: null, acceptedAt: null } },
  ],
});

export default TeamInvite;
