import { pushAnalysisQueue } from "../../lib/redis.js";

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

    const shouldAnalyze = branch && defaultBranch && branch === defaultBranch;
    if (!shouldAnalyze) {
      console.log("[push] skipped by branch-policy", { branch, defaultBranch });
      return { skipped: true, reason: "branch-policy", branch, defaultBranch };
    }

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
