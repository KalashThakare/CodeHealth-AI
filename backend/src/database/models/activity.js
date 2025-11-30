import sequelize from "../db.js"
import { DataTypes } from "sequelize"

const activity = sequelize.define("Activity",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    userId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    activity:{
        type:DataTypes.STRING,
        allowNull:false
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:false
    }
},
);

export default activity;