"use cleent";
import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.urlencoded({
    extended:true
}));
app.use(cookieparser());
app.use(express.json());




export default app;