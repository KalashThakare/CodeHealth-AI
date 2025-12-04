import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

const AlertTrigger = sequelize.define('AlertTrigger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  alertId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'AlertRule',
      key: 'id'
    }
  },
  
  triggeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  currentValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  
  thresholdValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  notificationSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  resolutionNotificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('active', 'resolved', 'acknowledged'),
    defaultValue: 'active'
  }
}, {
  tableName: 'alert_triggers',
  timestamps: true,
  indexes: [
    { fields: ['alertId'] },
    { fields: ['triggeredAt'] },
    { fields: ['status'] },
    { fields: ['notificationSent'] }
  ]
});

export default AlertTrigger;