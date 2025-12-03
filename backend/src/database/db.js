import {Sequelize} from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL,{
    dialect:"postgres",
    protocol:"postgres",
    dialectOptions:{
        ssl:{
            require:true,
            rejectUnauthorized:false,
        },
    },
    timezone: "+05:30",
    logging:false
})

export default sequelize;
