import sequelize from "../../db.js";
import { DataTypes } from "sequelize"


const alertRule = sequelize.define("AlertRule", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    repoId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },

    // Alert configuration
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    operator: {
        type: DataTypes.ENUM('<', '>', '<=', '>=', '=='),
        allowNull: false,
        defaultValue: '<'
    },

    threshold: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    cooldownMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 1440, // 24 hours
    },

    // Metadata
    lastTriggeredAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    triggerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }

}, {
    tableName: "AlertRule",
    indexes: [
        { fields: ['userId'] },
        { fields: ['repoId'] },
        { fields: ['isActive'] },
        { fields: ['userId', 'repoId'] }
    ]
});

export default alertRule;