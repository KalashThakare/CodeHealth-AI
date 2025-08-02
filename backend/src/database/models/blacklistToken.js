import { DataTypes } from 'sequelize';
import sequelize from '../db.js'; 

const BlacklistToken = sequelize.define('BlacklistToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'blacklist_tokens',
  timestamps: true
});

export default BlacklistToken;
