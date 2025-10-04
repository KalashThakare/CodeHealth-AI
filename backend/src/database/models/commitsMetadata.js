import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Commit = sequelize.define("Commit", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  repoId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sha: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  committerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  committerDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "commits",
  timestamps: true, 
});

export default Commit;
