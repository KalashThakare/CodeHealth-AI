import { pushAnalysisQueue } from "../../lib/redis.js";

export async function handlePush(payload) {

  const repo = payload.repository?.full_name;        // repo name
  const repoId = payload.repository?.id;
  const defaultBranch = payload.repository?.default_branch;
  const ref = payload.ref;                            // refs/heads/<branch>
  const branch = ref?.startsWith('refs/heads/') ? ref.slice('refs/heads/'.length) : ref;
  const installationId = payload.installation?.id ?? null;
  const pusher = payload.pusher?.name || payload.sender?.login || 'unknown';
  const headCommit = payload.head_commit || null;
  const commits = payload.commits || [];

  const shouldAnalyze = branch && defaultBranch && branch === defaultBranch; 

  if (!shouldAnalyze) {
    return { skipped: true, reason: 'branch-policy', branch, defaultBranch };
  }

  const jobData = {
    repo, 
    repoId, 
    branch, 
    headCommit, 
    installationId,
    commits,
    pusher
  }

  const jobId = headCommit ? `analysis:${repo}:${headCommit}` : `analysis:${repo}:${branch}:${Date.now()}`;
  await pushAnalysisQueue.add('analysis.push', jobData, { jobId });

  return { enqueued: true, repo, branch, headCommit };

}
