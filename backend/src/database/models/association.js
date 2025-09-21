import { Project } from "./project.js";
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

Project.hasMany(WebhookEvent, { foreignKey: 'projectId' });
WebhookEvent.belongsTo(Project, { foreignKey: 'projectId' });

