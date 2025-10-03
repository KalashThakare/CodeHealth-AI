import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const RepoFileMetrics = sequelize.define(
  "RepoFileMetrics",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    repoId: {
      type: DataTypes.BIGINT, 
      allowNull: true,
      references: {
        model: 'projects',
        key: 'repoId' 
      }
    },
    commitSha: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cyclomaticComplexity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maintainabilityIndex: {
      type: DataTypes.FLOAT, 
      allowNull: true,
    },

    // LOC breakdown
    locTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    locSource: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    locLogical: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    locComments: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    locBlank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Halstead core + commonly-used aggregates
    halsteadUniqueOperators: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halsteadUniqueOperands: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halsteadTotalOperators: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halsteadTotalOperands: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halsteadVocabulary: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halsteadLength: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halsteadVolume: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    analyzedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "repo_file_metrics",
    timestamps: true, 
    indexes: [
      { fields: ["repoId"] },
      { fields: ["commitSha"] },
      { fields: ["branch"] },
      { fields: ["path"] },
      { fields: ["repoId", "path", "analyzedAt"] },
      { 
        unique: true, 
        fields: ["path", "repoId"],
        name: "unique_path_repoId"
      },
    ],
  }
);

export default RepoFileMetrics
