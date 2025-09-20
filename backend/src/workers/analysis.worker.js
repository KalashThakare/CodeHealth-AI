import axios from "axios";
import { QueueEvents, Worker } from "bullmq";
import dotenv from "dotenv";
dotenv.config();


const CONCURRENCY = Number(process.env.ANALYSIS_CONCURRENCY || 4);
const DEADLINE_MS = Number(process.env.ANALYSIS_DEADLINE_MS || 15 * 60 * 1000);

export const PushAnalysisWorker = new Worker("pushAnalysis", async job => {

    if (job.name != "analysis.push") {
        return {
            skipped: true,
            reason: "Unkonwn-job",
            name: job.name
        }
    }

    const {
        repo,
        repoId,
        branch,
        headCommit,
        installationId,
        commits,
        pusher
    } = job.data || {};

    if (!repo || !branch || !installationId) {
        throw new Error(
            `Invalid job data: repo=${repo} branch=${branch} installationId=${installationId}`
        );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('deadline'), DEADLINE_MS);

    const runPayload = {
        repoFullName: repo,
        repoId,
        installationId,
        branch,
        headCommitSha: headCommit?.id ?? null,
        pushedBy: pusher,
        commitCount: commits.length,
        //including commit list if the pipeline needs it for selective fetch/analysis
        commits: commits.map(c => ({
            id: c.id,
            message: c.message,
            author: c.author?.username || c.author?.name,
            added: c.added,
            removed: c.removed,
            modified: c.modified
        }))
    };

    try {

        const url = process.env.ANALYSIS_INTERNAL_URL + 'v1/internal/analysis/run';
        await axios.post(url, runPayload, {
            timeout: 10_000, 
        });

        return {
            ok: true,
            repo,
            branch,
            headCommitSha: headCommit?.id ?? headCommit?.sha ?? null,
            summary: result?.summary ?? null
        };

    } finally {
        clearTimeout(timer);
    }
},
    {
        connection,
        concurrency: CONCURRENCY,
        // Optionally extend lock if steps can exceed default lock duration
        // lockDuration: 600000,
    }

);

const events = new QueueEvents('pushAnalysis', { connection });
events.on('completed', ({ jobId }) => {
  console.log(`[analysis] completed ${jobId}`);
});
events.on('failed', ({ jobId, failedReason }) => {
  console.error(`[pushAnalysis] failed ${jobId}: ${failedReason}`);
});
events.on('waiting', ({ jobId }) => console.log(`[pushAnalysis] waiting ${jobId}`));
events.on('progress', ({ jobId, data }) => console.log(`[pushAnalysis] progress ${jobId}`, data));

// Basic worker-level logs
PushAnalysisWorker.on('failed', (job, err) => {
  console.error(`[analysis] job failed ${job?.id}`, err);
});
PushAnalysisWorker.on('completed', job => {
  console.log(`[analysis] job completed ${job.id}`);
});

export const pullAnalysisWorker = new Worker("pullAnalysis",async job=>{

    if (job.name !== "analysis.pr") {
      return { skipped: true, reason: "unknown-job", name: job.name };
    }

    // Validate job data
    const {
      repo,
      repoId,
      installationId,
      prNumber,
      action,
      sender,
      head,
      base,
      isFromFork,
    } = job.data || {};

    if (!repo || !installationId || !prNumber || !head || !base) {
      throw new Error(
        `Invalid job data: repo=${repo} installationId=${installationId} prNumber=${prNumber} head=${!!head} base=${!!base}`
      );
    }

    const headSha = head.sha || null;
    const baseSha = base.sha || null;
    const headRef = head.ref || null;
    const baseRef = base.ref || null;

    // Optional: emit initial progress
    await job.updateProgress({ stage: "init", repo, prNumber, headSha, baseRef, headRef });

    // Set up deadline/abort control for the downstream call(s)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEADLINE_MS);

    try {
      const runPayload = {
        type: "pull_request",
        repoFullName: repo,
        repoId,
        installationId,
        prNumber,
        action,
        sender,
        isFromFork,
        head: {
          ref: headRef,
          sha: headSha,
          repoId: head.repoId || (head.repo && head.repo.id) || null,
          repoFullName: head.repoFullName || (head.repo && head.repo.full_name) || null,
        },
        base: {
          ref: baseRef,
          sha: baseSha,
          repoId: base.repoId || (base.repo && base.repo.id) || null,
          repoFullName: base.repoFullName || (base.repo && base.repo.full_name) || null,
        },
      };

      await job.updateProgress({ stage: "dispatch", to: "/internal/analysis/pr" });

      const url = process.env.ANALYSIS_INTERNAL_URL + "/internal/analysis/pr";
      const resp = await axios.post(url, runPayload, {
        timeout: Math.min(DEADLINE_MS - 1000, 30_000),
        signal: controller.signal,
      });

      await job.updateProgress({ stage: "completed", status: resp.status });

      return {
        ok: true,
        repo,
        prNumber,
        headSha,
        baseRef,
        summary: resp.data && resp.data.summary ? resp.data.summary : null,
      };
    } catch (err) {
      // Recognize deadline timeouts and mark accordingly
      if (err && err.name === "AbortError") {
        err.message = `PR analysis deadline exceeded (${DEADLINE_MS}ms)`;
      } else if (axios.isAxiosError && axios.isAxiosError(err)) {
        // Add context for axios failures
        const code = err.code || "AXIOS_ERR";
        const status = err.response && err.response.status;
        err.message = `PR analysis axios error code=${code} status=${status || "n/a"}: ${err.message}`;
      }
      // Let BullMQ handle retries/backoff per job options
      throw err;
    } finally {
      clearTimeout(timer);
    }
  },
  {
    connection,
    concurrency: CONCURRENCY,
    // lockDuration can be tuned if the job holds the lock longer than default
    // lockDuration: 600000,
  }
)

export const pullAnalysisEvents = new QueueEvents(QUEUE_NAME, { connection });
pullAnalysisEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`[pullAnalysis] completed ${jobId}`, returnvalue);
});
pullAnalysisEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`[pullAnalysis] failed ${jobId}: ${failedReason}`);
});
pullAnalysisEvents.on("progress", ({ jobId, data }) => {
  console.log(`[pullAnalysis] progress ${jobId}`, data);
});

// Worker-level events
pullAnalysisWorker.on("failed", (job, err) => {
  console.error(`[pullAnalysis] job failed ${job ? job.id : "unknown"}`, err);
});
pullAnalysisWorker.on("completed", job => {
  console.log(`[pullAnalysis] job completed ${job.id}`);
});
pullAnalysisWorker.on("error", err => {
  // Important to avoid unhandled error events that can stop processing
  console.error(`[pullAnalysis] worker error`, err);
});


export const issuesAnalysisWorker = new Worker("issuesAnalysisQueue",async job=>{
  
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

      await job.updateProgress({ stage: "dispatch", to: "/internal/analysis/issue" });

      const url = process.env.ANALYSIS_INTERNAL_URL + "/internal/analysis/issue";
      const resp = await axios.post(url, runPayload, {
        timeout: Math.min(DEADLINE_MS - 1000, 20_000),
        signal: controller.signal,
      });

      await job.updateProgress({ stage: "completed", status: resp.status });

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
    // lockDuration: 300000, // optionally tune if needed
  }
)

export const issuesAnalysisEvents = new QueueEvents(QUEUE_NAME, { connection });
issuesAnalysisEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`[issuesAnalysis] completed ${jobId}`, returnvalue);
});
issuesAnalysisEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`[issuesAnalysis] failed ${jobId}: ${failedReason}`);
});
issuesAnalysisEvents.on("progress", ({ jobId, data }) => {
  console.log(`[issuesAnalysis] progress ${jobId}`, data);
});