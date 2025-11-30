import axios from "axios";
import { generateState, generateCodeVerifier } from "arctic";
import { github } from "../lib/OAuth/github.js";
import crypto from "crypto";
import User from "../database/models/User.js";
import { Project } from "../database/models/project.js";
import { WebhookEvent } from "../database/models/webhookEvents.js";
import { connection, pushAnalysisQueue, webhookQueue } from "../lib/redis.js";
import { handlePush } from "../services/handlers/push.handler.js";
import { handleIssues } from "../services/handlers/issues.handler.js";
import { handlePullRequest } from "../services/handlers/pull.handler.js";
import { Analyse_repo } from "./scanController.js";
import OAuthConnection from "../database/models/OauthConnections.js";

import { io } from "../server.js";
import { type } from "os";
import { time } from "console";
import notification from "../database/models/notification.js";
import { where } from "sequelize";
import activity from "../database/models/activity.js";

function eventToJobName(event) {
  switch (event) {
    case "push":
      return "repo.push";
    case "pull_request":
      return "repo.pull_request";
    case "issues":
      return "repo.issues";
    default:
      return "misc.unhandled";
  }
}

function isRepoScoped(event) {
  return event === "push" || event === "pull_request" || event === "issues";
}

function mapRepo(payload) {
  const repo = payload?.repository;
  if (!repo)
    return { repoId: null, fullName: null, repoUrl: null, repoName: null };
  const fullName = repo.full_name;
  const repoName = fullName?.split("/")?.[10] ?? null;
  return {
    repoId: repo.id ?? null,
    fullName,
    repoName,
    repoUrl:
      repo.html_url || (fullName ? `https://github.com/${fullName}` : null),
  };
}

export const ListRepos = async (req, res) => {
  try {
    // console.log(req.user);
    const userId = req.user?.id;
    // console.log(userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorised" });
    }

    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Project,
          attributes: [
            "id",
            "fullName",
            "repoName",
            "repoId",
            "repoUrl",
            "private",
            "installationId",
            "initialised",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // console.log(user.Projects);

    res.json(user.Projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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
    console.error("GitHub API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const tokenStatus = (req, res) => {
  const token = req.cookies?.gitHubtoken;
  if (token) {
    res.json({ hasToken: true });
  } else {
    res.json({ hasToken: false });
  }
};

export const getGitHubUser = async (req, res) => {
  try {
    const token =
      req.cookies?.gitHubtoken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Unauthorised" });
    }
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("GitHub API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const githubWebhookController = async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];
    const deliveryId = req.headers["x-github-delivery"];
    const payload = req.body;

    if (!signature) {
      return res.status(401).send("No X-Hub-Signature-256 header found");
    }

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const hmac = crypto.createHmac("sha256", secret);
    const digest =
      "sha256=" + hmac.update(JSON.stringify(payload)).digest("hex");

    const sigBuffer = Buffer.from(signature, "utf8");
    const digestBuffer = Buffer.from(digest, "utf8");

    if (
      sigBuffer.length !== digestBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, digestBuffer)
    ) {
      return res.status(401).send("Invalid signature");
    }

    const installationId = payload?.installation?.id ?? null;
    const { repoId, fullName, repoName } = mapRepo(payload);

    let project = null;
    if (isRepoScoped(event)) {
      if (repoId) project = await Project.findOne({ where: { repoId, initialised:"true" } });
      if (!project && repoName)
        project = await Project.findOne({ where: { repoName, initialised:"true" } });
      if (!project) return res.status(404).send("Repository not registered");

      await WebhookEvent.create({
        deliveryId,
        event,
        installationId,
        projectId: project?.id ?? null,
        repoId,
        fullName,
        status: "received",
        payload,
      });
    }

    if (event === "installation" || event === "installation_repositories") {
      const action = payload.action;
      const accountId = payload.installation?.account?.id?.toString() ?? null;

      if (!accountId) {
        return res
          .status(400)
          .json({ error: "Missing installation account id" });
      }

      const user = await OAuthConnection.findOne({
        where: {
          provider: "github",
          providerId: accountId,
        },
      });
      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found for this installation account" });
      }

      const userId = user.userId;

      if (event === "installation" && action === "created") {
        const repos = payload.repositories || [];
        for (const repo of repos) {
          const repoUrl =
            repo.html_url || `https://github.com/${repo.full_name}`;
          await Project.findOrCreate({
            where: { repoId: repo.id },
            defaults: {
              userId: userId,
              repoId: repo.id,
              repoName: repo.name,
              fullName: repo.full_name,
              private: repo.private,
              repoUrl,
              installationId,
            },
          });
        }
      }

      if (event === "installation_repositories" && action === "added") {
        const repos = payload.repositories_added || [];
        // console.log("Repositories added are:========================================",repos)
        // const results = []
        for (const repo of repos) {
          const repoUrl =
            repo.html_url || `https://github.com/${repo.full_name}`;
          await Project.findOrCreate({
            where: { repoId: repo.id },
            defaults: {
              userId: userId,
              repoId: repo.id,
              repoName: repo.name,
              fullName: repo.full_name,
              private: repo.private,
              repoUrl,
              installationId,
              initialised: "false",
            },
          });

          // const result = await Analyse_repo(repo.id);
          // results.push(result)
        }

        // console.log("Repositories results are:========================================",results)

        return res.status(200).json({ message: "Repos imported successfully" });
      }

      if (event === "installation_repositories" && action === "removed") {
        const repos = payload.repositories_removed || [];
        for (const repo of repos) {
          const repository = await Project.findOne({
            where: {
              repoId: repo.id,
            },
          });

          if (repository) {
            const userId = repository.userId;
            const repoName = repository.repoName;
            const repoId = repository.repoId;


            await Project.destroy({ where: { repoId: repo.id } });

            io.to(`user:${userId}`).emit("notification", {
              type: "remove",
              success: true,
              repoName,
              repoId,
              message: `Repository: ${repoName} removed successfully`,
              time: Date.now(),
            });

            await notification.create({
                userId:userId,
                title:"Repo removed",
                message:`You removed ${repoName}`
            })

            await activity.create({
              userId:userId,
              activity:`You removed ${repoName}`
            })
          }
        }
      }

      if (event === "installation" && action === "deleted") {
        const projects = await Project.findAll({
          where: { installationId },
        });

        if (projects && projects.length > 0) {
          const userId = projects[0].userId;

          const deleteCount = await Project.destroy({
            where: { installationId },
          });

          // Emit notification
          for (const project of projects) {
            io.to(`user:${userId}`).emit("notification", {
              type: "delete",
              success: deleteCount > 0,
              repoName: project.repoName,
              repoId: project.repoId,
              message:
                deleteCount > 0
                  ? `Repository: ${project.repoName} deleted successfully`
                  : `Repository: ${project.repoName} deletion failed`,
              time: Date.now(),
            });
          }

          await notification.create({
            userId:userId,
            title:"Github app uninstalled",
            message:`Github app uninstalled`
          })

          await activity.create({
            userId:userId,
            activity:"Github app uninstalled"
          })
        }
      }
    }

    if (event === "push") {
      if (!project) {
        if (repoId) project = await Project.findOne({ where: { 
          repoId:repoId,
          initialised:"true" 
        } });
        if (!project && repoName)
          project = await Project.findOne({ where: { repoName, initialised:"true" } });
      }

      if (repoId) {
        const cacheKey = `metrics:repo:${repoId}`;
        await connection.del(cacheKey);
        console.log(`Cache invalidated for repo ${repoId} due to push event`);
      }

      if (project && project.userId) {
        io.to(`user:${project.userId}`).emit("notification", {
          type: "push",
          repoName,
          repoId,
          message: `New push on ${fullName}`,
          time: Date.now(),
        });

        await notification.create({
          userId:project.userId,
          title:"New Push",
          message:`New push on ${fullName}`
        })
      }

      const result = await handlePush(payload);
      return res.status(200).json(result);
    }
    if (event === "pull_request") {
      const action = payload.action;

      if (!project) {
        if (repoId) project = await Project.findOne({ where: { repoId, initialised:"true" } });
        if (!project && repoName)
          project = await Project.findOne({ where: { repoName, initialised:"true" } });
      }

      if (action === "closed" && payload.pull_request?.merged) {
        if (repoId) {
          const cacheKey = `metrics:repo:${repoId}`;
          await connection.del(cacheKey);
          console.log(`Cache invalidated for repo ${repoId} due to PR merge`);
        }

        if (project && project.userId) {
          io.to(`user:${project.userId}`).emit("notification", {
            type: "pull",
            repoName,
            repoId,
            message: `New pull request closed and merged on ${fullName}`,
            time: Date.now(),
          });

          await notification.create({
          userId:project.userId,
          title:"PR",
          message:`New pull request closed and merged on ${fullName}`
        })
        }
      }

      if (action === "opened") {
        if (project && project.userId) {
          io.to(`user:${project.userId}`).emit("notification", {
            type: "pull",
            repoName,
            repoId,
            action: "opened",
            message: `New pull request #${payload.pull_request.number} opened on ${fullName}`,
            time: Date.now(),
          });
          await notification.create({
          userId:project.userId,
          title:"PR",
          message:`New pull request #${payload.pull_request.number} opened on ${fullName}`
        })
          
        }
      }

      if (action === "synchronize") {
        if (project && project.userId) {
          io.to(`user:${project.userId}`).emit("notification", {
            type: "pull",
            repoName,
            repoId,
            action: "opened",
            message: `New pull request #${payload.pull_request.number} synchronized on ${fullName}`,
            time: Date.now(),
          });
          await notification.create({
          userId:project.userId,
          title:"PR",
          message:`New pull request #${payload.pull_request.number} synchronized on ${fullName}`
        })
        }
      }

      const result = await handlePullRequest(payload);
      return res.status(200).json(result);
    }
    if (event === "issues") {
      const result = await handleIssues(payload);
      return res.status(200).json(result);
    }

    return res.status(202).send("ACK");
  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const retryWebhookDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const evt = await WebhookEvent.findByPk(deliveryId);
    if (!evt) return res.status(404).send("Delivery not found");

    if (isRepoScoped(evt.event) && !evt.projectId) {
      return res.status(409).send("Cannot retry: repository not registered");
    }

    const jobName = eventToJobName(evt.event);
    await webhookQueue.add(
      jobName,
      { event: evt.event, payload: evt.payload },
      { jobId: deliveryId }
    );
    await WebhookEvent.update(
      { status: "enqueued" },
      { where: { deliveryId } }
    );
    return res.status(202).send("Re-enqueued");
  } catch (err) {
    console.error("retry error:", err);
    return res.status(500).send("Internal Server Error");
  }
};
