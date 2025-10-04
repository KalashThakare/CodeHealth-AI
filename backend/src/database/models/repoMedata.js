import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const RepoMetadata = sequelize.define("RepoMetadata", {
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
  stars: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  forks: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  watchers: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  license: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  defaultBranch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  visibility: {
    type: DataTypes.ENUM("public", "private"),
    allowNull: false,
  },
}, {
  tableName: "repo_metadata",
  timestamps: true, 
});

export default RepoMetadata;
