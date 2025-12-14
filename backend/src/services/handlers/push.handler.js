import RepositoryAnalysis from "../../database/models/analysis.js";
import Commit from "../../database/models/commitsMetadata.js";
import { RepoPushEvent } from "../../database/models/repoAnalytics.js";
import { processPushAnalysis, processPushScan } from "../push.Service.js";


export async function handlePush(payload) {
  try {
    const repo = payload.repository?.full_name;
    const repoId = payload.repository?.id;
    const defaultBranch = payload.repository?.default_branch;
    const ref = payload.ref;
    const branch = ref?.startsWith("refs/heads/") ? ref.slice("refs/heads/".length) : ref;
    const installationId = payload.installation?.id ?? null;
    const pusher = payload.pusher?.name || payload.sender?.login || "unknown";
    const pusherGitHubId = payload.sender?.id || null;
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

    if (removedArray.length != 0) {
      const res = await removeFiles(repoId, removedArray);
      if (res) {
        console.log("Successfully deleted the files from database", res);
      }
    }

    try {
      const commitRecords = commits.map(commit => ({
        repoId: repoId,
        branch: branch,
        sha: commit.id,
        message: commit.message || '',
        authorName: commit.author?.name || commit.author?.username || 'unknown',
        authorEmail: commit.author?.email || 'unknown@example.com',
        authorDate: new Date(commit.timestamp || Date.now()),
        committerName: commit.committer?.name || commit.committer?.username || commit.author?.name || 'unknown',
        committerDate: new Date(commit.timestamp || Date.now()),
      }));

      const createdCommits = await Commit.bulkCreate(commitRecords, {
        updateOnDuplicate: ['message', 'branch', 'authorDate', 'committerDate'], 
        ignoreDuplicates: false 
      });

      console.log("[Commit] Stored commits:", {
        repoId,
        branch,
        commitsStored: createdCommits.length,
        totalCommits: commits.length
      });
    } catch (error) {
      console.error("[Commit] Error storing commits:", error);
    }

    try {
      const repoAnalysis = await RepositoryAnalysis.findOne({ where: { repoId: repoId } });

      if (repoAnalysis) {
        const previousCount = repoAnalysis.totalCommits || 0;
        const newTotal = previousCount + commits.length;

        await repoAnalysis.update({
          totalCommits: newTotal,
          lastCommit: new Date(headCommit?.timestamp || Date.now())
        });

        await repoAnalysis.reload();

        console.log("[RepositoryAnalysis] Updated commit count:", {
          repoId,
          previousCount,
          newCommits: commits.length,
          totalCommits: repoAnalysis.totalCommits,
          verified: repoAnalysis.totalCommits === newTotal
        });
      } else {
        console.log("[RepositoryAnalysis] No analysis record found for repoId:", repoId);
      }
    } catch (error) {
      console.error("[RepositoryAnalysis] Error updating commit count:", error);
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

    const ScanJobData = { repoId, repo, installationId, commitSha, branch, added: addedArray, modified: modifiedArray };

    try {
      const scanResult = await processPushScan(ScanJobData);

      console.log("[push] Scan completed", { repoId, scanResult });
    } catch (scanError) {
      console.error("[push] Scan failed", { repoId, error: scanError.message });
    }

    console.log("[pushScan] enqueue request", { ScanJobData });

    const jobData = { repo, repoId, branch, headCommit, installationId, commits, pusher };

    console.log("[push] enqueue request", { repo, repoId, branch, headSha: headCommit?.id, installationId });

    const baseId =
      headCommit?.id
        ? `analysis-${repo}-${headCommit.id}`
        : `analysis-${repo}-${branch}-${Date.now()}`;

    const safeId = baseId.replace(/[^\w.-]/g, "_");

    try {
      const pushAnalysis = await processPushAnalysis(jobData);
      console.log(pushAnalysis);
    } catch (error) {
      console.error("[push] Ananlysis failed", { repoId, error: scanError.message });
    }
    
    
  } catch (error) {
    console.error("[push] enqueue error", error);
    return { enqueued: false, error: String(error) };
  }
}

