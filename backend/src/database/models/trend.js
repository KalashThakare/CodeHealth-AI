import sequelize from "../db.js";
import { DataTypes } from "sequelize";

const trend = sequelize.define("trend", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4  // Add this to auto-generate UUIDs
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    repoId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'repoId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    healthScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    technicalDebth: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    highRiskFiles: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    velocityTrend: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    codeQuality:{
        type:DataTypes.FLOAT,
        allowNull:true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: "trend_analysis"
});

export default trend;