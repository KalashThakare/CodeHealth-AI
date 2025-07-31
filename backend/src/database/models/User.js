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
    allowNull: true, 
  },

  oauthProvider: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  oauthProviderId: {
    type: DataTypes.STRING,
    unique: true,
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

  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  tableName: "users",
  timestamps: true,
});

export default User;
