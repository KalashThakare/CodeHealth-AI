import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const OAuthConnection = sequelize.define("OAuthConnection", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE', // If user is deleted, delete their OAuth connections
  },
  provider: {
    type: DataTypes.STRING, // 'google', 'github', etc.
    allowNull: false,
  },
  providerId: {
    type: DataTypes.STRING, // The user's ID from that provider
    allowNull: false,
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // GitHub-specific field
  installationId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  // You can add more provider-specific fields as needed
}, {
  tableName: "oauth_connections",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'provider'], // One user can't have duplicate providers
    },
    {
      unique: true,
      fields: ['provider', 'providerId'], // One provider account can't link to multiple users
    }
  ]
});

export default OAuthConnection;