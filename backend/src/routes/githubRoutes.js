import express from "express";
import { getGitHubUser, githubWebhookController, ListRepos, manageGithubAppCallback, manageGitHubScopes, manageRedirect, retryWebhookDelivery, tokenStatus } from "../controller/gitHub.Controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requireGitHubInstallation, validateGitHubAppAccess } from "../middleware/validateGithubAccess.js";
import { importProjectsLimit } from "../config/rateLimiters.js";

const router = express.Router();

router.get("/repos",protectRoute, requireGitHubInstallation, ListRepos); 
router.get("/user", getGitHubUser);
router.get('/permissions', manageGitHubScopes);
router.get('/token-status', tokenStatus);

router.post(
  '/webhook',
  express.json({
    verify: (req, res, buf) => { req.rawBody = buf; }
  }),
  githubWebhookController
);

router.get('/app/callback', manageGithubAppCallback);

router.post('/webhooks/retry/:deliveryId', retryWebhookDelivery);

router.post('/github-app/redirect', 
  protectRoute,
  importProjectsLimit, 
  validateGitHubAppAccess,
  manageRedirect
);

export default router;