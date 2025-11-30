import RepositoryAnalysis from "./analysis.js";
import CommitsAnalysis from "./commit_analysis.js";
import Commit from "./commitsMetadata.js";
import notification from "./notification.js";
import OAuthConnection from "./OauthConnections.js";
import PullRequestAnalysis from "./pr_analysis_metrics.js";
import { Project } from "./project.js";
import PushAnalysisMetrics from "./pushAnalysisMetrics.js";
import  RepoFileMetrics  from "./repoFileMetrics.js";
import RepoMetadata from "./repoMedata.js";
import support from "./support.js";
import Team from "./team.js";
import TeamInvite from "./teamInvite.js";
import TeamMember from "./teamMember.js";
import User from "./User.js";
import { WebhookEvent } from "./webhookEvents.js";

Team.hasMany(TeamInvite, { foreignKey: "teamId" });
TeamInvite.belongsTo(Team, { foreignKey: "teamId" });

Team.hasMany(TeamMember, { foreignKey: "teamId" });
TeamMember.belongsTo(Team, { foreignKey: "teamId" });

User.hasMany(Team, { foreignKey: "userId", as: "createdTeams" });
Team.belongsTo(User, { foreignKey: "userId", as: "creator" });

User.belongsToMany(Team, { through: TeamMember, foreignKey: "userId", as: "teams" });
Team.belongsToMany(User, { through: TeamMember, foreignKey: "teamId", as: "members" });

User.hasMany(TeamInvite, { foreignKey: "invitedBy" });
TeamInvite.belongsTo(User, { foreignKey: "invitedBy", as: "InvitedByUser"});

User.hasMany(Project, { foreignKey: "userId" });
Project.belongsTo(User, { foreignKey: "userId" });

User.hasMany(support, { foreignKey: "userId" });
support.belongsTo(User, { foreignKey: "userId" });

User.hasMany(notification, { foreignKey: "userId" });
notification.belongsTo(User, { foreignKey: "userId" });

Project.hasMany(WebhookEvent, { foreignKey: 'projectId' });
WebhookEvent.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(RepoFileMetrics, {
  foreignKey: 'repoId',
  sourceKey:'repoId',
  as: 'fileMetrics',
  onDelete: 'CASCADE'
});

RepoFileMetrics.belongsTo(Project, {
  foreignKey: 'repoId',
  targetKey: 'repoId',
  as: 'project'
});

Project.hasMany(PushAnalysisMetrics, {
  foreignKey: 'repoId',
  sourceKey:'repoId',
  as: 'pushMetrics',
  onDelete: 'CASCADE'
});

PushAnalysisMetrics.belongsTo(Project, {
  foreignKey: 'repoId',
  targetKey: 'repoId',
  as: 'project'
});

Project.hasMany(CommitsAnalysis, {
  foreignKey: 'repoId',
  sourceKey:'repoId',
  as: 'commit_analysis',
  onDelete: 'CASCADE'
});

CommitsAnalysis.belongsTo(Project, {
  foreignKey: 'repoId',
  targetKey: 'repoId',
  as: 'project'
});

Project.hasMany(Commit, {
  foreignKey: 'repoId',
  sourceKey:'repoId',
  as: 'commits',
  onDelete: 'CASCADE'
});

Commit.belongsTo(Project, {
  foreignKey: 'repoId',
  targetKey: 'repoId',
  as: 'project'
});

Project.hasMany(RepoMetadata, {
  foreignKey: 'repoId',
  sourceKey:'repoId',
  as: 'repo_metadata',
  onDelete: 'CASCADE'
});

RepoMetadata.belongsTo(Project, {
  foreignKey: 'repoId',
  targetKey: 'repoId',
  as: 'project'
});

Project.hasMany(RepositoryAnalysis, {
  foreignKey: 'repoId',
  sourceKey:'repoId',
  as: 'repository_analyses',
  onDelete: 'CASCADE'
});

RepositoryAnalysis.belongsTo(Project, {
  foreignKey: 'repoId',
  targetKey: 'repoId',
  as: 'project'
});

Project.hasMany(PullRequestAnalysis, {
  foreignKey: 'repoId',
  sourceKey:'repoId',
  as: 'pr_analyses',
  onDelete: 'CASCADE'
});

PullRequestAnalysis.belongsTo(Project, {
  foreignKey: 'repoId',
  targetKey: 'repoId',
  as: 'project'
});

User.hasMany(OAuthConnection, { 
  foreignKey: 'userId',
  as: 'oauthConnections' 
});

OAuthConnection.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user' 
});

