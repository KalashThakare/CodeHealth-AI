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
    console.log(req.user)
    const userId = req.user?.id;
    console.log(userId)
    if (!userId) {
      return res.status(401).json({ error: "Unauthorised" });
    }

    const user = await User.findOne({
      where: { id: userId },
      include: [{
        model: Project,
        attributes: ['id', 'repoName', 'repoUrl', 'installationId', 'createdAt', 'updatedAt']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.Projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const manageGitHubScopes = async (req, res) => {
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

    const sigBuffer = Buffer.from(signature, "utf8");
    const digestBuffer = Buffer.from(digest, "utf8");

    if (
      sigBuffer.length !== digestBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, digestBuffer)
    ) {
      return res.status(401).send("Invalid signature");
    }

    console.log(`📦 Received GitHub event: ${event}, action: ${payload.action}`);

    const processRepos = async (repos, installationId, accountId) => {
      const user = await User.findOne({
        where: { oauthProviderId: accountId.toString() }
      });

      if (!user) {
        console.warn(`⚠️ No user with oauthProviderId=${accountId} found in DB`);
        return false;
      }

      console.log(`✅ Found user: ${user.email || user.id}`);

      for (const repo of repos) {
        const repoUrl = repo.html_url || `https://github.com/${repo.full_name}`;
        const [project, created] = await Project.findOrCreate({
          where: { repoName: repo.name, userId: user.id },
          defaults: {
            userId: user.id,
            repoName: repo.name,
            repoUrl,
            installationId
          }
        });

        console.log(created
          ? `📌 Added repo ${repo.name} for ${user.email}`
          : `ℹ️ Repo ${repo.name} already exists for ${user.email}`);
      }

      return true;
    };

    // 1. Initial installation
    if (event === "installation" && payload.action === "created") {
      const ok = await processRepos(
        payload.repositories || [],
        payload.installation.id,
        payload.installation.account.id
      );
      return res.status(ok ? 200 : 404).send("Installation event processed");
    }

    // 2. Repo added to app
    if (event === "installation_repositories" && payload.action === "added") {
      const ok = await processRepos(
        payload.repositories_added || [],
        payload.installation.id,
        payload.installation.account.id
      );
      return res.status(ok ? 200 : 404).send("Repos added");
    }

    // 3. Repo removed from app
    if (event === "installation_repositories" && payload.action === "removed") {
      const accountId = payload.installation.account.id;
      const reposRemoved = payload.repositories_removed || [];
      const user = await User.findOne({
        where: { oauthProviderId: accountId.toString() }
      });

      if (!user) {
        console.warn(`⚠️ No user found for accountId ${accountId}`);
        return res.status(404).send("User not found");
      }

      for (const repo of reposRemoved) {
        await Project.destroy({
          where: { repoName: repo.name, userId: user.id }
        });
        console.log(`🗑 Removed repo ${repo.name} for ${user.email}`);
      }
      return res.status(200).send("Repos removed");
    }

    res.status(200).send("Event received (unhandled type)");
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};