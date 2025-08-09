import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";

export const Project = sequelize.define("Project", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  repoName: { type: DataTypes.STRING, allowNull: false },
  repoUrl: { type: DataTypes.STRING, allowNull: false },
  installationId: { type: DataTypes.BIGINT, allowNull: false, unique: true },
}, {
  tableName: "projects",
  timestamps: true,
});

User.hasMany(Project, { foreignKey: "userId" });
Project.belongsTo(User, { foreignKey: "userId" });
