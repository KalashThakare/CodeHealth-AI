import express from "express";
import { getGitHubUser, githubWebhookController, ListRepos, manageGitHubScopes, retryWebhookDelivery, tokenStatus } from "../controller/gitHub.Controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validateGitHubAppAccess } from "../middleware/validateGithubAccess.js";
import { generateSecureState } from "../utils/functions.js";

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

router.post('/github-app/redirect', 
  protectRoute, 
  validateGitHubAppAccess, 
  async (req, res) => {
    try {
      const state = generateSecureState(req.user.id);
    const redirectUrl = `${process.env.WEB_APP_REDIRECT_URI}?state=${state}`;

    console.log(redirectUrl);
    
    return res.status(200).json({ 
      redirectUrl,
      hasExistingInstallation: !!req.existingInstallation
    });
      
    } catch (error) {
      console.error(error)
      return res.status(500).json({message:"Internal server error"});
    }
    
  }
);

export default router;