import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";

const Team = sequelize.define("Team", {
    id: {
        type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },

    name: {
        type: DataTypes.STRING, allowNull: false
    },
    slug: {
        type: DataTypes.STRING, allowNull: false, unique: true
    },
    description: {
        type: DataTypes.TEXT, allowNull: true
    },
}, {
    tableName: "teams",
    timestamps: true,
    indexes: [
        { unique: true, fields: ["slug"] },
        { fields: ["userId"] },
    ],
});

User.hasMany(Team, { foreignKey: "userId", as: "createdTeams" });
Team.belongsTo(User, { foreignKey: "userId", as: "creator" });

export default Team;
