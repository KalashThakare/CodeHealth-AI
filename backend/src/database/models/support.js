import sequelize from "../db.js";
import { DataTypes } from "sequelize";

const support = sequelize.define("support",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    userId:{
        type:DataTypes.UUID,
        allowNull:false
    },
    caseId:{
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    problem:{
        type:DataTypes.STRING,
        allowNull:false
    },
},
{
    timestamps:true,
}
)

export default support