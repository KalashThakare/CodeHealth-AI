import express from "express";
import { getGitHubUser, githubWebhookController, ListRepos, manageGitHubScopes, retryWebhookDelivery, tokenStatus } from "../controller/gitHub.Controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/repos",protectRoute, ListRepos); 
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

router.post('/webhooks/retry/:deliveryId', retryWebhookDelivery);

export default router;