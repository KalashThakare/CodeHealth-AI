import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const PushAnalysisMetrics = sequelize.define(
  "PushAnalysisMetrics",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    repository: {
      type: DataTypes.STRING,
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
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    commitSha: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    // Analysis metrics
    impact: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    threshold: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ok: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Files array stored as JSON
    files: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of file changes with sha, filename, status, additions, deletions, changes, urls, and patch'
    },
    // Risk analysis stored as JSON
    riskAnalysis: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Object containing impactedFiles array and candidates array'
    },
    analyzedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "push_analysis_metrics",
    timestamps: true,
    indexes: [
      { fields: ["repoId"] },
      { fields: ["repository"] },
      { fields: ["branch"] },
      { fields: ["commitSha"] },
      { fields: ["repoId", "branch", "analyzedAt"] },
      { fields: ["ok"] },
      { fields: ["impact"] },
      { fields: ["score"] },
      // GIN index for JSONB querying
      { 
        fields: ["files"],
        using: 'GIN'
      },
      {
        fields: ["riskAnalysis"],
        using: 'GIN'
      }
    ],
  }
);

export default PushAnalysisMetrics;