import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Null for OAuth users
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // OPTIONAL: Keep these fields for backward compatibility
  // or remove them after migration
  oauthProvider: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  oauthProviderId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  oauthAccessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  oauthRefreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  githubInstallationId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  alternateEmail:{
    type:DataTypes.STRING,
    allowNull:true
  },
  contactNo:{
    type:DataTypes.STRING,
    allowNull:true
  }
}, {
  tableName: "users",
  timestamps: true,
});

export default User;