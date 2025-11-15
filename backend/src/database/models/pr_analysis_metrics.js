import { DataTypes } from 'sequelize';
import sequelize from '../db.js'; 

const PullRequestAnalysis = sequelize.define('PullRequestAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Foreign key to Project
  repoId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'projects', 
      key: 'repoId'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  
  // PR identifiers
  repo: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Full repository name (owner/repo)'
  },
  
  prNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Pull request number'
  },
  
  baseRef: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Base branch reference'
  },
  
  // Overall scores
  score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Overall PR score (0-1)'
  },
  
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Human-readable summary'
  },
  
  // Metrics (stored as JSONB for flexibility)
  metrics: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detailed metrics object',
    defaultValue: {}
  },
  
  // Annotations array
  annotations: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Code annotations and warnings',
    defaultValue: []
  },
  
  // Suggestions array
  suggestions: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Improvement suggestions',
    defaultValue: []
  },
  
  // Security warnings
  securityWarnings: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Security-related warnings',
    defaultValue: null
  },
  
  // Recommended reviewers
  recommendedReviewers: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Suggested reviewers',
    defaultValue: null
  },
  
  // Timestamp from analysis
  analyzedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the analysis was performed'
  },
  
}, {
  tableName: 'pull_request_analyses',
  timestamps: true, // Adds createdAt and updatedAt
  indexes: [
    {
      unique: true,
      fields: ['repoId', 'prNumber'],
      name: 'unique_repo_pr'
    },
    {
      fields: ['repo']
    },
    {
      fields: ['analyzedAt']
    },
    {
      fields: ['metrics'],
      using: 'gin' // For JSONB queries (PostgreSQL)
    }
  ]
});


export default PullRequestAnalysis;