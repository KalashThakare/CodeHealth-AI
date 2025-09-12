import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import { Project } from "./project.js";

export const WebhookEvent = sequelize.define('WebhookEvent', {
  deliveryId: { type: DataTypes.STRING, primaryKey: true }, 
  event: { type: DataTypes.STRING, allowNull: false },
  installationId: { type: DataTypes.BIGINT },
  repoId: { type: DataTypes.BIGINT },        
  fullName: { type: DataTypes.STRING },       
  status: { type: DataTypes.STRING, defaultValue: 'received' },
  payload: { type: DataTypes.JSONB, allowNull: false },
}, {
  tableName: 'webhook_events',
  indexes: [
    { unique: true, fields: ['deliveryId'] },
    { fields: ['projectId'] },
    { fields: ['repoId'] },
    { fields: ['event'] },
    { fields: ['status'] },
  ],
});

Project.hasMany(WebhookEvent, { foreignKey: 'projectId' });
WebhookEvent.belongsTo(Project, { foreignKey: 'projectId' });
