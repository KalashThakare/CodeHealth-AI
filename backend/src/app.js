"use cleent";
import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import sequelize from "./database/db.js";

dotenv.config();

const app = express();

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

export default app;