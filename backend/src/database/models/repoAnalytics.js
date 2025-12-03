import { DataTypes } from "sequelize";
import sequelize from "../db.js";

export const RepoPushEvent = sequelize.define("RepoPushEvent", {
  id: { 
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true 
  },
  repoId: { type: DataTypes.BIGINT, allowNull: false },
  userId: { type: DataTypes.BIGINT }, // GitHub user ID
  commitCount: { type: DataTypes.INTEGER, allowNull: false },
  branch: { type: DataTypes.STRING, allowNull: false },
  pushedAt: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: "repo_push_events",
  timestamps: true,
  indexes: [
    { fields: ["repoId"] },
    { fields: ["pushedAt"] },
    { fields: ["branch"] },
  ]
});

export const PullRequestActivity = sequelize.define("PullRequestActivity", {
  id: { 
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true 
  },
  repoId: { type: DataTypes.BIGINT, allowNull: false },
  prNumber: { type: DataTypes.INTEGER, allowNull: false },
  state: { type: DataTypes.STRING }, // open, closed, merged
  title: { type: DataTypes.STRING },
  authorId: { type: DataTypes.BIGINT }, // GitHub user ID
  createdAtGitHub: { type: DataTypes.DATE },
  closedAtGitHub: { type: DataTypes.DATE },
  mergedAtGitHub: { type: DataTypes.DATE },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  firstReviewedAt: { type: DataTypes.DATE },
  timeToFirstReview: { type: DataTypes.INTEGER }, // minutes
  timeToMerge: { type: DataTypes.INTEGER }, // minutes
}, {
  tableName: "pull_request_activities",
  timestamps: true,
  indexes: [
    { unique: true, fields: ["repoId", "prNumber"] }, // Prevent duplicate PRs
    { fields: ["repoId"] }, 
    { fields: ["state"] },
  ]
});

export const PullRequestReviewActivity = sequelize.define("PullRequestReviewActivity", {
  id: { 
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true 
  },
  repoId: { type: DataTypes.BIGINT, allowNull: false },
  prNumber: { type: DataTypes.INTEGER, allowNull: false },
  reviewerId: { type: DataTypes.BIGINT }, // GitHub user ID
  reviewerName: { type: DataTypes.STRING },
  reviewState: { type: DataTypes.STRING }, // approved, pending, changes_requested
  reviewedAt: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: "pull_request_review_events",
  timestamps: true,
  indexes: [
    { fields: ["repoId"] }, 
    { fields: ["prNumber"] },
    { fields: ["repoId", "prNumber"] },
  ]
});

export const FileActivity = sequelize.define("FileActivity", {
  id: { 
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true 
  },
  repoId: { type: DataTypes.BIGINT, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false },
  commitCount30Days: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastModifiedAt: { type: DataTypes.DATE },
}, {
  tableName: "file_activities",
  timestamps: true,
  indexes: [
    { fields: ["repoId"] }, 
    { fields: ["filePath"] },
    { unique: true, fields: ["repoId", "filePath"] }, // One record per file per repo
  ]
});