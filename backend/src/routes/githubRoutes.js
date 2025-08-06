import express from "express";
import { ListRepos, manageGitHubScopes } from "../controller/gitHub.Controller.js";

const router = express.Router();

router.get("/users/:username/repos",ListRepos)
router.get('/permissions', manageGitHubScopes);

export default router;