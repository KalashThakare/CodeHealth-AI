import express from "express";
import { getGitHubUser, ListRepos, manageGitHubScopes, tokenStatus } from "../controller/gitHub.Controller.js";

const router = express.Router();

router.get("/repos", ListRepos); 
router.get("/user", getGitHubUser);
router.get('/permissions', manageGitHubScopes);
router.get('/token-status', tokenStatus);

export default router;




// router.get("/users/:username/repos",ListRepos)
// router.get('/permissions', manageGitHubScopes);
// router.get('/token-status', tokenStatus);
// router.get('/github/user', getGitHubUser)