import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";

export const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    installationId: { type: DataTypes.BIGINT, allowNull: false },
    repoId: { type: DataTypes.BIGINT, allowNull: false, unique: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    repoName: { type: DataTypes.STRING, allowNull: false },
    repoUrl: { type: DataTypes.STRING, allowNull: false },
    private:{type: DataTypes.BOOLEAN, allowNull:true},
    initialised:{type:DataTypes.BOOLEAN, allowNull:false, defaultValue:false},
    analysisStatus: {
      type: DataTypes.ENUM('idle', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'idle'
    },
    analysisStartedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    analysisCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  {
    tableName: "projects",
    timestamps: true,
    indexes: [
      { fields: ["installationId"] },
      { unique: false, fields: ["userId", "repoName"] },
      { fields: ["analysisStatus"] },
      { fields: ["userId", "analysisStatus"] } 
    ],
  }
);
