import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const CommitsAnalysis = sequelize.define("CommitsAnalysis", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  repoId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalCommits: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  topContributors: {
    type: DataTypes.JSONB, 
    allowNull: false,
  },
  commitsPerDay: {
    type: DataTypes.JSONB, 
    allowNull: false,
  },
}, {
  tableName: "commits_analysis",
  timestamps: true, 
});

export default CommitsAnalysis;