import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

export const PushActivityMetrics = sequelize.define('PushActivityMetrics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  repoId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY, 
    allowNull: false
  },
  
  // Daily aggregations
  totalPushes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalCommits: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  uniqueContributors: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Hourly distribution 
  hourlyDistribution: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  // Branch activity
  activeBranches: {
    type: DataTypes.JSON,
    defaultValue: [] 
  },
  
  // Contributor details
  contributorActivity: {
    type: DataTypes.JSON,
    defaultValue: [] 
  },
  
  // Activity status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'push_activity_metrics',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['repoId', 'date'] }, // One record per repo per day
    { fields: ['repoId'] },
    { fields: ['date'] },
    { fields: ['isActive'] }
  ]
});