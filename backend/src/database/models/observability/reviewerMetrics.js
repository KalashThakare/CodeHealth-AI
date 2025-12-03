import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

export const ReviewerMetrics = sequelize.define('ReviewerMetrics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  repoId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  reviewerId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  reviewerName: {
    type: DataTypes.STRING
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  
  // Review activity
  reviewsGiven: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgResponseTime: {
    type: DataTypes.FLOAT,
    defaultValue: 0 // minutes
  },
  
  // Review outcomes
  approvals: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  changesRequested: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Performance indicators
  isBottleneck: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Response time > team average * 1.5
  },
  pendingReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // Current open PRs assigned to this reviewer
  },
  
  // 30-day rolling metrics
  reviews30Days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgResponseTime30Days: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'reviewer_metrics',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['repoId', 'reviewerId', 'date'] },
    { fields: ['repoId'] },
    { fields: ['reviewerId'] },
    { fields: ['date'] },
    { fields: ['isBottleneck'] }
  ]
});