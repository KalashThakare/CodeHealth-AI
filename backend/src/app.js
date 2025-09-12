import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import sequelize from "./database/db.js";
import cors from "cors"
import OAuth from "./routes/OAuth.routes.js"
import githubRoutes from "./routes/githubRoutes.js";
import Auth from "../src/routes/authRoutes.js"
import teamRoutes from "./routes/teamRoutes.js";
import { protectRoute } from "./middleware/auth.middleware.js";
import { receiveFeedbackController } from "./controller/feedback&review.Controller.js";
import accountRoutes from "../src/routes/account.Routes.js"


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
app.use("/manual-auth",Auth);
app.use("/github",githubRoutes)
app.use("/teams",teamRoutes)

app.post("/feedback",protectRoute,receiveFeedbackController);

app.use("/account",accountRoutes)

export default app;