"use cleent";
import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import sequelize from "./database/db.js";
import cors from "cors"
import OAuth from "./routes/OAuth.routes.js"
import githubRoutes from "./routes/githubRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}))
app.use(express.urlencoded({
    extended:true
}));
app.use(cookieparser());
app.use(express.json());


export async function startApp() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    return app;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}


app.use("/auth",OAuth);
app.use("/github",githubRoutes)

export default app;