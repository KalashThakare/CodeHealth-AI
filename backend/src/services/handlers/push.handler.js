import { RepoPushEvent } from "../../database/models/repoAnalytics.js";
import { pushAnalysisQueue } from "../../lib/redis.js";
import { pushScanQueue } from "../../lib/redis.js";
import { removeFiles } from "../../utils/functions.js";

export async function handlePush(payload) {
  try {
    const repo = payload.repository?.full_name;
    const repoId = payload.repository?.id;
    const defaultBranch = payload.repository?.default_branch;
    const ref = payload.ref;
    const branch = ref?.startsWith("refs/heads/") ? ref.slice("refs/heads/".length) : ref;
    const installationId = payload.installation?.id ?? null;
    const pusher = payload.pusher?.name || payload.sender?.login || "unknown";
    const headCommit = payload.head_commit || null;
    const commits = payload.commits || [];
    const commitSha = payload.head_commit?.id || payload.after || null;

    const shouldAnalyze = branch && defaultBranch && branch === defaultBranch;
    if (!shouldAnalyze) {
      console.log("[push] skipped by branch-policy", { branch, defaultBranch });

      // for analytics
      await RepoPushEvent.create({
        repoId,
        userId: pusherGitHubId,
        commitCount: commits.length,
        branch,
        pushedAt: new Date(payload.head_commit?.timestamp || Date.now()),
      });


      return { skipped: true, reason: "branch-policy", branch, defaultBranch };
    }

    const added = new Set();
    const removed = new Set();
    const modified = new Set();

    for (const commit of commits) {
      (commit.added || []).forEach(file => added.add(file));
      (commit.removed || []).forEach(file => removed.add(file));
      (commit.modified || []).forEach(file => modified.add(file));
    }

    modified.forEach(file => {
      if (added.has(file)) {
        modified.delete(file);
      }
    });

    added.forEach(file => {
      if (removed.has(file)) {
        added.delete(file);
        removed.delete(file);
      }
    });

    modified.forEach(file => {
      if (removed.has(file)) {
        modified.delete(file);
      }
    });

    const addedArray = Array.from(added);
    const modifiedArray = Array.from(modified);
    const removedArray = Array.from(removed);

    if(removedArray.length != 0){
      const res = await removeFiles(repoId, removedArray);
      if(res){
        console.log("Success fully deleted the files from database", res);
      }
    }

    await RepoPushEvent.create({
      repoId,
      userId: pusherGitHubId,
      commitCount: commits.length,
      branch,
      pushedAt: new Date(headCommit?.timestamp || Date.now()),
    });

    console.log("[analytics] Push event stored:", {
      repoId,
      commitCount: commits.length,
      branch,
    });

    const scanJobId = `scan-${repoId}-${headCommit?.id || Date.now()}`;
    const safeScanJobId = scanJobId.replace(/[^\w.-]/g, "_");

    const ScanJobData = {repoId, repo, installationId, commitSha, branch, added:addedArray, modified:modifiedArray};

    const ScanJob = await pushScanQueue.add("Scan", ScanJobData,{
      jobId:safeScanJobId
    })

    console.log("[pushScan] enqueue request", { ScanJobData });


    const jobData = { repo, repoId, branch, headCommit, installationId, commits, pusher };

    console.log("[push] enqueue request", { repo, repoId, branch, headSha: headCommit?.id, installationId });

    const baseId =
      headCommit?.id
        ? `analysis-${repo}-${headCommit.id}`
        : `analysis-${repo}-${branch}-${Date.now()}`;

    const safeId = baseId.replace(/[^\w.-]/g, "_");

    const job = await pushAnalysisQueue.add("analysis.push", jobData, {
      jobId: safeId,
    });

    const state = await job.getState();
    const counts = await pushAnalysisQueue.getJobCounts();

    console.log("[push] enqueued", { id: job.id, state, counts });

    return { enqueued: true, id: job.id, state, repo, branch, headCommit: headCommit?.id ?? null };
  } catch (error) {
    console.error("[push] enqueue error", error);
    return { enqueued: false, error: String(error) };
  }
}
