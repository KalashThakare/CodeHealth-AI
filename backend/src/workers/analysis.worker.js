import axios from "axios";
import { QueueEvents, Worker } from "bullmq";
import { connection } from "../lib/redis.js";
import dotenv from "dotenv";
import { analyzeFile } from "../utils/AST.js";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";
import { Project } from "../database/models/project.js";
import { Queue } from 'bullmq';
import { io } from "../server.js";
import PullRequestAnalysis from "../database/models/pr_analysis_metrics.js";
import { triggerBackgroundAnalysis } from "../controller/analysisController.js";

dotenv.config();


const CONCURRENCY = Number(process.env.ANALYSIS_CONCURRENCY || 4);
const DEADLINE_MS = Number(process.env.ANALYSIS_DEADLINE_MS || 15 * 60 * 1000);

export const PushAnalysisWorker = new Worker(
  "pushAnalysis",
  async job => {
    console.log("[push] worker received job", { id: job.id, name: job.name });

    if (job.name !== "analysis.push") {
      return { skipped: true, reason: "unknown-job", name: job.name };
    }

    const { repo, repoId, branch, headCommit, installationId, commits, pusher } = job.data || {};
    if (!repo || !branch || !installationId) {
      throw new Error(`Invalid job data: repo=${repo} branch=${branch} installationId=${installationId}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("deadline"), DEADLINE_MS);

    const runPayload = {
      repoFullName: repo,
      repoId,
      installationId,
      branch,
      headCommitSha: headCommit?.id ?? headCommit?.sha ?? null,
      pushedBy: pusher,
      commitCount: Array.isArray(commits) ? commits.length : 0,
      commits: (commits || []).map(c => ({
        id: c.id,
        message: c.message,
        author: c.author?.username || c.author?.name,
        added: c.added,
        removed: c.removed,
        modified: c.modified,
      })),
    };

    try {
      const url = process.env.ANALYSIS_INTERNAL_URL + "/v1/internal/analysis/run";
      const { data } = await axios.post(url, runPayload, {
        timeout: 10_000,
        signal: controller.signal,
      });

      return {
        ok: true,
        repo,
        branch,
        headCommitSha: headCommit?.id ?? headCommit?.sha ?? null,
        score: data?.score ?? null,
        summary: data?.message ?? null,
      };
    } finally {
      clearTimeout(timer);
    }
  },
  { connection, concurrency: CONCURRENCY }
);

PushAnalysisWorker.on("ready", () => console.log("[push] worker ready"));
PushAnalysisWorker.on("error", err => console.error("[push] worker error", err));
PushAnalysisWorker.on("failed", (job, err) => console.error(`[push] job failed ${job?.id}`, err));
PushAnalysisWorker.on("completed", job => console.log(`[push] job completed ${job.id}`));

const events = new QueueEvents("pushAnalysis", { connection });
events.on("waiting", ({ jobId }) => console.log("[push] waiting", jobId));
events.on("active", ({ jobId }) => console.log("[push] active", jobId));
events.on("completed", ({ jobId }) => console.log("[push] completed", jobId));
events.on("failed", ({ jobId, failedReason }) => console.error("[push] failed", jobId, failedReason));



export const pullAnalysisWorker = new Worker(
  "pullAnalysis",
  async (job) => {
    if (job.name !== "analysis.pr") {
      return { skipped: true, reason: "unknown-job", name: job.name };
    }

    const {
      repoFullName,
      repoId,
      installationId,
      prNumber,
      action,
      sender,
      head,
      base,
      isFromFork,
    } = job.data || {};

    if (!repoFullName || !installationId || !prNumber || !head || !base) {
      throw new Error(
        `Invalid job data: repo=${repoFullName} installationId=${installationId} prNumber=${prNumber} head=${!!head} base=${!!base}`
      );
    }

    const headSha = head.sha || null;
    const baseSha = base.sha || null;
    const headRef = head.ref || null;
    const baseRef = base.ref || null;

    await job.updateProgress({
      stage: "init",
      repo: repoFullName,
      prNumber,
      headSha,
      baseRef,
      headRef
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEADLINE_MS);

    try {
      const runPayload = {
        type: "pull_request",
        repoFullName,
        repoId,
        installationId,
        prNumber,
        action,
        sender,
        isFromFork,
        head: {
          ref: headRef,
          sha: headSha,
          repoId: head.repoId || null,
          repoFullName: head.repoFullName || null,
        },
        base: {
          ref: baseRef,
          sha: baseSha,
          repoId: base.repoId || null,
          repoFullName: base.repoFullName || null,
        },
      };

      await job.updateProgress({ stage: "dispatch", to: "v1/internal/analysis/pr" });

      const url = process.env.ANALYSIS_INTERNAL_URL + "/v1/internal/analysis/pr"

      console.log(`Calling Python service: ${url}`);
      console.log(`Payload:`, JSON.stringify(runPayload, null, 2));

      const resp = await axios.post(url, runPayload, {
        timeout: Math.min(DEADLINE_MS - 1000, 60_000),
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      await job.updateProgress({ stage: "completed", status: resp.status });

      console.log(`PR analysis completed for ${repoFullName}#${prNumber}`);

      console.log(resp.data);

      if (resp.data.repoId) {
        const repo = await Project.findOne({
          where: {
            repoId: resp.data.repoId
          }
        })

        if (!repo) {
          throw new Error("Repository dosent exist");
        }

        const pr = await PullRequestAnalysis.findOne({
          where: {
            repoId: repoId,
            prNumber: prNumber
          }
        })

        if (pr) {

          await PullRequestAnalysis.update({
            repoId: resp.data.repoId,
            repo: resp.data.repo,
            prNumber: resp.data.prNumber,
            baseRef: resp.data.baseRef,
            score: resp.data.score,
            summary: resp.data.summary,
            metrics: resp.data.metrics,
            annotations: resp.data.annotations,
            suggestions: resp.data.suggestions,
            securityWarnings: resp.data.securityWarnings,
            recommendedReviewers: resp.data.recommendedReviewers,
            analyzedAt: resp.data.analyzedAt ? new Date(resp.data.analyzedAt) : new Date()
          },

            {
              where: {
                repoId: repoId,
                prNumber: prNumber
              }
            }

          );

        } else {
          await PullRequestAnalysis.create({
            repoId: resp.data.repoId,
            repo: resp.data.repo,
            prNumber: resp.data.prNumber,
            baseRef: resp.data.baseRef,
            score: resp.data.score,
            summary: resp.data.summary,
            metrics: resp.data.metrics,
            annotations: resp.data.annotations,
            suggestions: resp.data.suggestions,
            securityWarnings: resp.data.securityWarnings,
            recommendedReviewers: resp.data.recommendedReviewers,
            analyzedAt: resp.data.analyzedAt ? new Date(resp.data.analyzedAt) : new Date()
          });
        }
      }

      return {
        ok: true,
        repoId,
        repo: repoFullName,
        prNumber,
        headSha,
        baseRef,
        headRef,
        analysis: resp.data,
        summary: resp.data?.summary || null,
        score: resp.data?.score || null,
        metrics: resp.data?.metrics || null,
      };
    } catch (err) {
      if (err.name === "AbortError") {
        console.error(`PR analysis deadline exceeded (${DEADLINE_MS}ms) for ${repoFullName}#${prNumber}`);
        err.message = `PR analysis deadline exceeded (${DEADLINE_MS}ms)`;
      } else if (axios.isAxiosError(err)) {
        const code = err.code || "AXIOS_ERR";
        const status = err.response?.status;
        const errorData = err.response?.data;

        console.error(`PR analysis axios error for ${repoFullName}#${prNumber}:`, {
          code,
          status,
          message: err.message,
          data: errorData,
        });

        err.message = `PR analysis axios error code=${code} status=${status || "n/a"}: ${err.message}`;
      } else {
        console.error(`PR analysis unexpected error for ${repoFullName}#${prNumber}:`, err);
      }

      throw err;
    } finally {
      clearTimeout(timer);
    }
  },
  {
    connection,
    concurrency: CONCURRENCY,
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // per second
    },
  }
);

pullAnalysisWorker.on("ready", () => console.log("[pull] worker ready"));
pullAnalysisWorker.on("error", err => console.error("[pull] worker error", err));
pullAnalysisWorker.on("failed", (job, err) => console.error(`[pull] job failed ${job?.id}`, err));
pullAnalysisWorker.on("completed", job => console.log(`[pull] job completed ${job.id}`));

const pullEvents = new QueueEvents("pullAnalysis", { connection });
pullEvents.on("waiting", ({ jobId }) => console.log("[pull] waiting", jobId));
pullEvents.on("active", ({ jobId }) => console.log("[pull] active", jobId));
pullEvents.on("completed", ({ jobId }) => console.log("[pull] completed", jobId));
pullEvents.on("failed", ({ jobId, failedReason }) => console.error("[pull] failed", jobId, failedReason));
process.on("SIGTERM", async () => {
  console.log("Closing connections...");
  await pullEvents.close();
  await pullAnalysisWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Closing connections...");
  await pullEvents.close();
  await pullAnalysisWorker.close();
  process.exit(0);
});


export const issuesAnalysisWorker = new Worker("issuesAnalysis", async job => {

  if (job.name !== "analysis.issue") {
    return { skipped: true, reason: "unknown-job", name: job.name };
  }

  const { repo, repoId, installationId, action, sender, issue, isFromFork } = job.data || {};
  if (!repo || !installationId || !issue || !issue.number) {
    throw new Error(
      `Invalid job data: repo=${repo} installationId=${installationId} issue#=${issue && issue.number}`
    );
  }

  await job.updateProgress({ stage: "init", repo, issueNumber: issue.number, action });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEADLINE_MS);

  try {
    const runPayload = {
      type: "issue",
      repoFullName: repo,
      repoId,
      installationId,
      action,
      sender,
      isFromFork: Boolean(isFromFork),
      issue: {
        number: issue.number,
        title: issue.title || null,
        state: issue.state || null,
        labels: Array.isArray(issue.labels)
          ? issue.labels.map(l => (typeof l === "string" ? l : l && l.name)).filter(Boolean)
          : [],
        assignees: Array.isArray(issue.assignees)
          ? issue.assignees.map(a => a && a.login).filter(Boolean)
          : [],
        author: issue.user && issue.user.login,
        createdAt: issue.createdAt || issue.created_at || null,
        updatedAt: issue.updatedAt || issue.updated_at || null,
        closedAt: issue.closedAt || issue.closed_at || null,
        body: issue.body || null,
      },
    };

    await job.updateProgress({ stage: "dispatch", to: "v1/internal/analysis/issue" });

    const url = process.env.ANALYSIS_INTERNAL_URL + "v1/internal/analysis/issue";
    const resp = await axios.post(url, runPayload, {
      timeout: Math.min(DEADLINE_MS - 1000, 20_000),
      signal: controller.signal,
    });

    await job.updateProgress({ stage: "completed", status: resp.status });

    console.log(resp.data);

    return {
      ok: true,
      repo,
      issueNumber: issue.number,
      action,
      summary: resp.data && resp.data.summary ? resp.data.summary : null,
    };
  } catch (err) {
    if (err && err.name === "AbortError") {
      err.message = `Issue analysis deadline exceeded (${DEADLINE_MS}ms)`;
    } else if (axios.isAxiosError && axios.isAxiosError(err)) {
      const code = err.code || "AXIOS_ERR";
      const status = err.response && err.response.status;
      err.message = `Issue analysis axios error code=${code} status=${status || "n/a"}: ${err.message}`;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
},
  {
    connection,
    concurrency: CONCURRENCY,
  }
)

issuesAnalysisWorker.on("ready", () => console.log("[issue] worker ready"));
issuesAnalysisWorker.on("error", err => console.error("[issue] worker error", err));
issuesAnalysisWorker.on("failed", (job, err) => console.error(`[issue] job failed ${job?.id}`, err));
issuesAnalysisWorker.on("completed", job => console.log(`[issue] job completed ${job.id}`));

const issueEvents = new QueueEvents("issueAnalysis", { connection });
issueEvents.on("waiting", ({ jobId }) => console.log("[issue] waiting", jobId));
issueEvents.on("active", ({ jobId }) => console.log("[issue] active", jobId));
issueEvents.on("completed", ({ jobId }) => console.log("[issue] completed", jobId));
issueEvents.on("failed", ({ jobId, failedReason }) => console.error("[issue] failed", jobId, failedReason));


export const Analyse_repo_Worker = new Worker(
  "fullRepoAnalysis",
  async job => {
    console.log("[analyse] worker received job", { id: job.id, name: job.name });

    if (job.name !== "fullRepoAnalysis") {
      return { skipped: true, reason: "unknown-job", name: job.name };
    }

    const {
      repoId,
      owner,
      repoName,
      fullName,
      defaultBranch,
      installationId,
      requestedBy,
      requestedAt,
    } = job.data || {};

    if (!repoId || !owner || !repoName || !fullName || !defaultBranch || !installationId) {
      throw new Error(
        `Invalid job data: repoId=${repoId} owner=${owner} repoName=${repoName} fullName=${fullName} defaultBranch=${defaultBranch} installationId=${installationId}`
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("deadline"), DEADLINE_MS);

    try {
      const url = `${process.env.ANALYSIS_INTERNAL_URL}/v1/internal/analysis/full-repo`;
      const runPayload = {
        repoId,
        owner,
        repoName,
        fullName,
        branch: defaultBranch,
        installationId,
        requestedBy: requestedBy || "manual",
        requestedAt: requestedAt || new Date().toISOString(),
      };

      await job.updateProgress({ stage: "dispatch", ts: Date.now() });

      const { data } = await axios.post(url, runPayload, {
        timeout: Math.min(DEADLINE_MS - 1000, 290000),
        signal: controller.signal,
      });

      await job.updateProgress({ stage: "received", ts: Date.now() });

      return {
        ok: true,
        repoId,
        fullName,
        branch: defaultBranch,
        requestedBy: requestedBy || "manual",
        score: data?.score ?? null,
        summary: data?.message ?? null,
        findings: data?.findings ?? null,
        runId: data?.runId ?? null,
      };
    } finally {
      clearTimeout(timer);
    }
  },
  { connection, concurrency: CONCURRENCY }
);

Analyse_repo_Worker.on("ready", () => console.log("[analyse] worker ready"));
Analyse_repo_Worker.on("error", err => console.error("[analyse] worker error", err));
Analyse_repo_Worker.on("failed", (job, err) => console.error(`[analyse] job failed ${job?.id}`, err));
Analyse_repo_Worker.on("completed", job => console.log(`[analyse] job completed ${job.id}`));


const analyseEvents = new QueueEvents("fullRepoAnalysis", { connection });
analyseEvents.on("waiting", ({ jobId }) => console.log("[analyse] waiting", jobId));
analyseEvents.on("active", ({ jobId }) => console.log("[analyse] active", jobId));
analyseEvents.on("completed", ({ jobId }) => console.log("[analyse] completed", jobId));
analyseEvents.on("failed", ({ jobId, failedReason }) => console.error("[analyse] failed", jobId, failedReason));

export const ASTworker = new Worker(
  "repoFiles",
  async job => {
    const { path, content, repoId, branch } = job.data;
    console.log(`Analyzing file: ${path}`);

    if (!repoId) {
      console.error(`[ast] Missing repoId for file: ${path}`);
      return {
        path,
        error: true,
        errorMessage: 'Missing repoId in job data'
      };
    }

    try {

      const project = await Project.findOne({
        where: { repoId: repoId }
      });

      if (!project) {
        console.error(`[ast] Project with repoId ${repoId} not found`);
        return {
          path,
          error: true,
          errorMessage: `Project with repoId ${repoId} not found`
        };
      }

      const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
      const fileExtension = path.substring(path.lastIndexOf('.'));

      if (!validExtensions.includes(fileExtension)) {
        console.log(`[ast] Skipping ${path} - not a JS/TS file`);
        return {
          path,
          skipped: true,
          reason: 'Not a JavaScript/TypeScript file'
        };
      }

      const metrics = analyzeFile(content);

      let metric = await RepoFileMetrics.findOne({
        where: {
          path: path,
          repoId: repoId
        }
      });

      const metricData = {
        path: path,
        branch: branch,
        repoId: repoId,
        cyclomaticComplexity: metrics.cc,
        maintainabilityIndex: Math.round(metrics.mi * 100) / 100,
        locTotal: metrics.loc.loc,
        locSource: metrics.loc.sloc,
        locLogical: metrics.loc.lloc,
        locComments: metrics.loc.cloc,
        locBlank: metrics.loc.blank,
        halsteadUniqueOperators: metrics.halstead.n1,
        halsteadUniqueOperands: metrics.halstead.n2,
        halsteadTotalOperators: metrics.halstead.N1,
        halsteadTotalOperands: metrics.halstead.N2,
        halsteadVocabulary: metrics.halstead.vocabulary,
        halsteadLength: metrics.halstead.length,
        halsteadVolume: Math.round(metrics.halstead.volume * 100) / 100,
        analyzedAt: new Date()
      };

      if (metric) {
        await metric.update(metricData);
        console.log(`[ast] Updated existing metric for ${path}`);
      } else {
        metric = await RepoFileMetrics.create(metricData);
        console.log(`[ast] Created new metric for ${path}`);
      }

      const result = {
        path,
        repoId,
        branch,
        metrics: {
          cyclomaticComplexity: metrics.cc,
          loc: {
            total: metrics.loc.loc,
            source: metrics.loc.sloc,
            logical: metrics.loc.lloc,
            comments: metrics.loc.cloc,
            blank: metrics.loc.blank
          },
          maintainabilityIndex: Math.round(metrics.mi * 100) / 100,
          halstead: {
            uniqueOperators: metrics.halstead.n1,
            uniqueOperands: metrics.halstead.n2,
            totalOperators: metrics.halstead.N1,
            totalOperands: metrics.halstead.N2,
            vocabulary: metrics.halstead.vocabulary,
            length: metrics.halstead.length,
            volume: Math.round(metrics.halstead.volume * 100) / 100
          }
        },
        analyzedAt: new Date().toISOString()
      };

      console.log(`[ast] Completed ${path}: CC=${metrics.cc}, MI=${result.metrics.maintainabilityIndex}`);

      return result;

    } catch (error) {
      console.error(`[ast] Error analyzing ${path}:`, error.message);

      return {
        path,
        error: true,
        errorMessage: error.message,
        analyzedAt: new Date().toISOString()
      };
    }
  },
  {
    connection,
    concurrency: 5
  }
);

const ASTQueue = new Queue('repoFiles', { connection });

ASTworker.on("ready", () => console.log("[ast] worker ready"));
ASTworker.on("error", err => console.error("[ast] worker error", err));
ASTworker.on("failed", async (job, err) => {
  console.error(`[ast] job failed ${job?.id}`, err);

  if (job?.data && io) {
    const { repoId, repoName, fullName, userId } = job.data;

    io.to(`user:${userId}`).emit('analysis_complete', {
      success: false,
      repoId,
      repoName,
      fullName,
      stage: 'ast_analysis',
      error: err.message || 'AST analysis failed',
      timestamp: new Date().toISOString()
    });
  }
});

ASTworker.on("completed", async (job) => {
  console.log(`[ast] job completed ${job.id}`);

  if (job?.data && io) {
    const { repoId, repoName, fullName, userId } = job.data;

    // Check if this is the last job for this repo
    const remainingJobs = await ASTQueue.getWaitingCount() + await ASTQueue.getActiveCount();
    
    if (remainingJobs === 0) {
      // All files processed, trigger background analysis once
      console.log(`[ast] All files processed for repo ${repoId}, triggering background analysis`);
      
      try {
        await triggerBackgroundAnalysis(repoId);
        
        io.to(`user:${userId}`).emit('analysis_complete', {
          success: true,
          repoId,
          repoName,
          fullName,
          stage: 'repository_analysis',
          message: 'Repository analysis completed successfully',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`[ast] Background analysis failed for repo ${repoId}:`, error);
        
        io.to(`user:${userId}`).emit('analysis_complete', {
          success: false,
          repoId,
          repoName,
          fullName,
          stage: 'repository_analysis',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // Still processing files, just notify file completion
      io.to(`user:${userId}`).emit('file_analyzed', {
        repoId,
        path: job.data.path,
        timestamp: new Date().toISOString()
      });
    }
  }
});

const astEvents = new QueueEvents("repoFiles", { connection });
astEvents.on("waiting", ({ jobId }) => console.log("[ast] waiting", jobId));
astEvents.on("active", ({ jobId }) => console.log("[ast] active", jobId));
astEvents.on("completed", ({ jobId }) => console.log("[ast] completed", jobId));
astEvents.on("failed", ({ jobId, failedReason }) => console.error("[ast] failed", jobId, failedReason));
