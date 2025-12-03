import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

export const PRVelocityMetrics = sequelize.define('PRVelocityMetrics', {
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
  
  // Daily PR counts
  prsOpened: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  prsMerged: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  prsClosed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Time metrics (in minutes)
  avgTimeToMerge: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  medianTimeToMerge: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  avgTimeToFirstReview: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  medianTimeToFirstReview: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  
  // PR state distribution
  openPRs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stalePRs: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // PRs open > 7 days with no activity
  },
  
  // Review metrics
  avgReviewsPerPR: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  prsWithoutReview: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Detailed breakdown (JSON)
  prsByState: {
    type: DataTypes.JSON,
    defaultValue: {} // { open: 15, merged: 8, closed: 2 }
  },
  
  mergeTimeDistribution: {
    type: DataTypes.JSON,
    defaultValue: {} // { under1Hour: 5, under1Day: 10, under1Week: 3, over1Week: 2 }
  },
  
  reviewTimeDistribution: {
    type: DataTypes.JSON,
    defaultValue: {} // { under1Hour: 15, under4Hours: 8, under1Day: 5, over1Day: 2 }
  }
}, {
  tableName: 'pr_velocity_metrics',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['repoId', 'date'] },
    { fields: ['repoId'] },
    { fields: ['date'] }
  ]
});