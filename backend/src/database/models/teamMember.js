import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";
import Team from "./team.js";

const TeamMember = sequelize.define("TeamMember", {
    id: {
        type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    teamId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teams", key: "id" },
        onDelete: "CASCADE",
    },
    role: {
        type: DataTypes.ENUM("Owner", "Manager", "Member"),
        allowNull: false,
        defaultValue: "Member",
    },
}, {
    tableName: "team_members",
    timestamps: true,
    indexes: [
        { unique: true, fields: ["userId", "teamId"] },
        { fields: ["teamId", "role"] },
    ],
});

User.belongsToMany(Team, { through: TeamMember, foreignKey: "userId", as: "teams" });
Team.belongsToMany(User, { through: TeamMember, foreignKey: "teamId", as: "members" });

export default TeamMember;
