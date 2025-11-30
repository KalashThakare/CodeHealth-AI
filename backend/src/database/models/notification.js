import sequelize from "../db.js";
import { DataTypes } from "sequelize";

const notification = sequelize.define("notification", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    alert:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
},
    {
        timestamps: true
    }
)

export default notification;