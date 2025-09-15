import { pullAnalysisQueue } from "../../lib/redis";

export async function handlePullRequest(payload) {
  
  const repo = payload.repository && payload.repository.full_name;         // owner/repo
  const repoId = payload.repository && payload.repository.id;
  const action = payload.action;                                           // opened|synchronize|reopened|closed|...
  const pr = payload.pull_request;                                         // PR object
  const installationId = (payload.installation && payload.installation.id) || null;
  const sender = (payload.sender && payload.sender.login) || "unknown";

  // Validate minimal requirements
  if (!repo || !pr || !installationId) {
    return { skipped: true, reason: "invalid-payload", repo, installationId, hasPr: Boolean(pr) };
  }

  // Extract PR specifics
  const prNumber = pr.number;
  const head = pr.head;                   // source branch/ref
  const base = pr.base;                   // target branch/ref
  const headSha = (head && head.sha) || null;
  const baseSha = (base && base.sha) || null;
  const headRef = (head && head.ref) || null;   // e.g., feature/x
  const baseRef = (base && base.ref) || null;   // e.g., main
  const isFromFork = head && base && head.repo && base.repo
    ? head.repo.id !== base.repo.id
    : false;

  // Only analyze actionable PR events
  const actionable = action === "opened" || action === "reopened" || action === "synchronize";
  if (!actionable) {
    return { skipped: true, reason: "non-actionable", action, prNumber };
  }

  const jobData = {
    repo,
    repoId,
    installationId,
    prNumber,
    action,
    sender,
    head: {
      ref: headRef,
      sha: headSha,
      repoId: head && head.repo && head.repo.id,
      repoFullName: head && head.repo && head.repo.full_name,
    },
    base: {
      ref: baseRef,
      sha: baseSha,
      repoId: base && base.repo && base.repo.id,
      repoFullName: base && base.repo && base.repo.full_name,
    },
    isFromFork,
  };

  const headKey = headSha ? `-${headSha}` : "";
  const jobId = `pr-${repo}-${prNumber}${headKey}`; 

  await pullAnalysisQueue.add("analysis.pr", jobData, {
    jobId,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 1000,
    priority: 3,
  });

  // Respond quickly to the webhook
  return { enqueued: true, repo, prNumber, action, headSha, baseRef, headRef };
}
