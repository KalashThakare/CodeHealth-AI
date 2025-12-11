"use client"
import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import sequelize from "./database/db.js";
import cors from "cors"
import { receiveFeedbackController } from "./controller/feedback&review.Controller.js";
//Routes
import OAuth from "./routes/OAuth.routes.js";
import githubRoutes from "./routes/githubRoutes.js";
import Auth from "../src/routes/authRoutes.js"
import teamRoutes from "./routes/teamRoutes.js";
import { protectRoute } from "./middleware/auth.middleware.js";
import accountRoutes from "../src/routes/account.Routes.js"
import scanningRoutes from "./routes/scanning.Routes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import dashboardRoutes from "./routes/dashboard.Routes.js"
import supportRoutes from "./routes/supportRoutes.js"
import activityRoutes from "./routes/activity.Routes.js"
import notificationsRoutes from "./routes/notificationRoutes.js"
import observabilityRoutes from "./routes/observability.Routes.js"
import alertRoutes from "./routes/alertRoutes.js"
//databaseAssociation
import "./database/models/index.js"
//Workers
import "./workers/analysis.worker.js"
import "./workers/scanning.worker.js"



dotenv.config();

const app = express();


app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}))
app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({
    limit: '100mb',
    extended:true
}));
app.use(cookieparser());


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

app.use("/manual-auth",Auth);

app.use("/github",githubRoutes);

app.use("/teams",teamRoutes);

app.post("/feedback",protectRoute,receiveFeedbackController);

app.use("/account",accountRoutes);

app.use("/scanning",scanningRoutes);

app.use("/analyze",analysisRoutes);

app.use("/dashboard",dashboardRoutes)

app.use("/support",supportRoutes)

app.use("/notifications", notificationsRoutes);

app.use("/activity", activityRoutes)

app.use("/observability", observabilityRoutes);

app.use("/alertrule", alertRoutes)

export default app;