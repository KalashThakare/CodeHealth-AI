import express from "express";
import { ListRepos } from "../controller/gitHub.Controller.js";

const router = express.Router();

router.get("/users/:username/repos",ListRepos)

export default router;