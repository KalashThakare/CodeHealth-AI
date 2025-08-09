import axios from "axios";
import { generateState, generateCodeVerifier } from "arctic";
import { github } from "../lib/OAuth/github.js";
import crypto from 'crypto';
import User from "../database/models/User.js";
import { Project } from "../database/models/project.js";

await User.sync();
await Project.sync();

export const ListRepos = async (req, res) => {
    try {
        const token = req.cookies?.gitHubtoken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(400).json({ message: "Unauthorised" });
        }

        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
            }
        });

        return res.status(200).json(response.data);

    } catch (error) {

        console.error('GitHub API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });

    }
}

export const manageGitHubScopes =async(req,res)=>{
    try {

        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const scopes = ["repo", "read:user", "user:email"];

        res.cookie("github_oauth_state", state, {
            httpOnly: true,
            maxAge: 600000,
            sameSite: "lax",
        });
        res.cookie("github_code_verifier", codeVerifier, {
            httpOnly: true,
            maxAge: 600000,
            sameSite: "lax",
        });

  
        const authURL = github.createAuthorizationURL(state, scopes);

        res.redirect(authURL);
        
    } catch (error) {

        console.error('GitHub API error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Internal server error' });
        
    }
}

export const tokenStatus = (req, res) => {
  const token = req.cookies?.gitHubtoken;
  if (token) {
    res.json({ hasToken: true });
  } else {
    res.json({ hasToken: false });
  }
}

export const getGitHubUser = async (req, res) => {
  try {
    const token = req.cookies?.gitHubtoken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Unauthorised" });
    }
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      }
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('GitHub API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}


export const githubWebhookController = async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];
    const payload = req.body;

    if (!signature) {
      return res.status(401).send("No X-Hub-Signature-256 header found");
    }

    // Verify signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(JSON.stringify(payload)).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      return res.status(401).send("Invalid signature");
    }

    console.log(`Received GitHub event: ${event}, action: ${payload.action}`);

    // Handle Installation Created (initial install of app)
    if (event === "installation" && payload.action === "created") {
      const installationId = payload.installation.id;
      const accountLogin = payload.installation.account.login;
      const accountId = payload.installation.account.id;
      const repos = payload.repositories || [];

      // Find your user by provider ID (assuming you store GitHub account ID in oauthProviderId)
      const user = await User.findOne({
        where: { oauthProviderId: accountId.toString() }
      });

      if (!user) {
        console.warn(`User with GitHub account ${accountLogin} not found in DB`);
        return res.status(404).send("User not found");
      }

      // Store each repo in DB
      for (const repo of repos) {
        await Project.findOrCreate({
          where: { repoName: repo.name, userId: user.id },
          defaults: {
            userId: user.id,
            repoName: repo.name,
            repoUrl: repo.html_url,
            installationId
          }
        });
      }

      console.log(
        `Stored ${repos.length} repos for user ${accountLogin} (instId: ${installationId})`
      );
      return res.status(200).send("Installation event processed");
    }

    // Handle Repo Added to Installation
    if (event === "installation_repositories" && payload.action === "added") {
      const installationId = payload.installation.id;
      const accountId = payload.installation.account.id;
      const reposAdded = payload.repositories_added || [];

      const user = await User.findOne({
        where: { oauthProviderId: accountId.toString() }
      });
      if (!user) {
        return res.status(404).send("User not found");
      }

      for (const repo of reposAdded) {
        await Project.findOrCreate({
          where: { repoName: repo.name, userId: user.id },
          defaults: {
            userId: user.id,
            repoName: repo.name,
            repoUrl: repo.html_url,
            installationId
          }
        });
      }

      console.log(`Added ${reposAdded.length} repos for user ${user.email}`);
      return res.status(200).send("Repos added");
    }

    // Handle Repo Removed from Installation
    if (event === "installation_repositories" && payload.action === "removed") {
      const accountId = payload.installation.account.id;
      const reposRemoved = payload.repositories_removed || [];

      const user = await User.findOne({
        where: { oauthProviderId: accountId.toString() }
      });
      if (!user) {
        return res.status(404).send("User not found");
      }

      for (const repo of reposRemoved) {
        await Project.destroy({
          where: { repoName: repo.name, userId: user.id }
        });
      }

      console.log(`Removed ${reposRemoved.length} repos for user ${user.email}`);
      return res.status(200).send("Repos removed");
    }

    res.status(200).send("Event received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};


