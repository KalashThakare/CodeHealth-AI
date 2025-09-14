import axios from "axios";
import { QueueEvents, Worker } from "bullmq";
import dotenv from "dotenv";
dotenv.config();


const CONCURRENCY = Number(process.env.ANALYSIS_CONCURRENCY || 4);
const DEADLINE_MS = Number(process.env.ANALYSIS_DEADLINE_MS || 15 * 60 * 1000);

const AnalysisWorker = new Worker("analysis", async job => {

    if (job.name != "analysis.run") {
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

        const url = process.env.ANALYSIS_INTERNAL_URL + '/internal/analysis/run';
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

const events = new QueueEvents('analysis', { connection });
events.on('completed', ({ jobId }) => {
  console.log(`[analysis] completed ${jobId}`);
});
events.on('failed', ({ jobId, failedReason }) => {
  console.error(`[analysis] failed ${jobId}: ${failedReason}`);
});
events.on('waiting', ({ jobId }) => console.log(`[analysis] waiting ${jobId}`));
events.on('progress', ({ jobId, data }) => console.log(`[analysis] progress ${jobId}`, data));

// Basic worker-level logs
AnalysisWorker.on('failed', (job, err) => {
  console.error(`[analysis] job failed ${job?.id}`, err);
});
AnalysisWorker.on('completed', job => {
  console.log(`[analysis] job completed ${job.id}`);
});

export default AnalysisWorker;