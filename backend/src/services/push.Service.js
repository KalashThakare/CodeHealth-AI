import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DEADLINE_MS = Number(process.env.ANALYSIS_DEADLINE_MS || 15 * 60 * 1000);

export async function processPushScan(data) {
  console.log("[PushScan] Processing scan request", { repoId: data.repoId, commitSha: data.commitSha });

  const { repoId, added, modified, commitSha, repo, installationId, branch } = data;

  if (!added || !modified || !repoId || !commitSha || !repo || !installationId || !branch) {
    throw new Error("Invalid scan data, required fields are missing");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("deadline"), DEADLINE_MS);

  const payload = {
    repoId,
    installationId,
    repoName: repo,
    commitSha,
    branch,
    filesAdded: Array.isArray(added) ? added : Array.from(added),
    filesModified: Array.isArray(modified) ? modified : Array.from(modified),
  };

  try {
    const url = process.env.ANALYSIS_INTERNAL_URL + "/v3/internal/pushScan/run";
    
    console.log("[PushScan] Sending request to analysis service", { 
      url, 
      filesAdded: payload.filesAdded.length,
      filesModified: payload.filesModified.length 
    });

    const { data: responseData } = await axios.post(url, payload, {
      timeout: 10_000,
      signal: controller.signal
    });

    console.log("[PushScan] Scan completed successfully", { repoId, commitSha });

    return {
      ok: true,
      data: responseData
    };

  } catch (error) {
    console.error("[PushScan] Scan failed", { 
      repoId, 
      commitSha, 
      error: error.message 
    });

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Scan timeout after ${DEADLINE_MS}ms`);
      }
      if (error.response) {
        throw new Error(`Analysis service error: ${error.response.status} - ${error.response.statusText}`);
      }
      throw new Error(`Network error: ${error.message}`);
    }

    throw error;

  } finally {
    clearTimeout(timer);
  }
}

export async function processPushAnalysis(data) {
  console.log("[push] Processing analysis", { repoId: data.repoId });

  const { repo, repoId, branch, headCommit, installationId, commits, pusher } = data;
  
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
    const { data: responseData } = await axios.post(url, runPayload, {
      timeout: 120_000,
      signal: controller.signal,
    });

    return {
      ok: true,
      repo,
      branch,
      headCommitSha: headCommit?.id ?? headCommit?.sha ?? null,
      score: responseData?.score ?? null,
      summary: responseData?.message ?? null,
    };
  } finally {
    clearTimeout(timer);
  }
}

