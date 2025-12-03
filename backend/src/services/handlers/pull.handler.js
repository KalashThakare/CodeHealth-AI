import { pullAnalysisQueue } from "../../lib/redis.js";
import { PullRequestActivity } from "../../database/models/repoAnalytics.js";

export async function handlePullRequest(payload) {
  const repoFullName = payload.repository?.full_name;
  const repoId = payload.repository?.id;
  const action = payload.action;
  const pr = payload.pull_request;
  const installationId = payload.installation?.id || null;
  const sender = payload.sender?.login || "unknown";

  if (!repoFullName || !pr || !installationId) {
    console.warn("Invalid PR payload:", { repoFullName, installationId, hasPr: Boolean(pr) });
    return { skipped: true, reason: "invalid-payload" };
  }

  const prNumber = pr.number;
  const head = pr.head;
  const base = pr.base;
  const headSha = head?.sha || null;
  const baseSha = base?.sha || null;
  const headRef = head?.ref || null;
  const baseRef = base?.ref || null;

  const isFromFork =
    head?.repo && base?.repo ? head.repo.id !== base.repo.id : false;

    //PR analytics

  try {
    let existing = await PullRequestActivity.findOne({
      where: { repoId, prNumber },
    });

    if (action === "opened") {
      const createdAtGitHub = new Date(pr.created_at);

      await PullRequestActivity.upsert({
        repoId,
        prNumber,
        state: "open",
        title: pr.title,
        authorId: pr.user?.id,
        createdAtGitHub,
        reviewCount: existing?.reviewCount ?? 0,
      });

      console.log(`[analytics] PR #${prNumber} opened`);
    }

    if (action === "reopened") {
      await PullRequestActivity.upsert({
        repoId,
        prNumber,
        state: "open",
        title: pr.title,
      });

      console.log(`[analytics] PR #${prNumber} reopened`);
    }

    if (action === "synchronize") {
      if (existing) {
        await existing.update({
          state: "open",
        });
      }

      console.log(`[analytics] PR #${prNumber} synchronized`);
    }

    if (action === "closed") {
      if (!existing) {
        existing = await PullRequestActivity.create({
          repoId,
          prNumber,
          title: pr.title,
          createdAtGitHub: new Date(pr.created_at),
        });
      }

      if (pr.merged) {
        const mergedAt = new Date(pr.merged_at);
        const createdAt = new Date(existing.createdAtGitHub);

        const timeToMergeMinutes = Math.floor((mergedAt - createdAt) / 1000 / 60);

        await existing.update({
          state: "merged",
          mergedAtGitHub: mergedAt,
          closedAtGitHub: new Date(pr.closed_at),
          timeToMerge: timeToMergeMinutes,
        });

        console.log(`[analytics] PR #${prNumber} merged — time to merge ${timeToMergeMinutes} min`);
      } else {
        await existing.update({
          state: "closed",
          closedAtGitHub: new Date(pr.closed_at),
        });

        console.log(`[analytics] PR #${prNumber} closed (not merged)`);
      }
    }
  } catch (err) {
    console.error("PR analytics error:", err);
  }

  //Queue logic

  const actionable = action === "opened" || action === "reopened" || action === "synchronize";
  if (!actionable) {
    console.log(`Skipping non-actionable PR event: ${action} for PR #${prNumber}`);
    return { skipped: true, reason: "non-actionable" };
  }

  const jobData = {
    type: "pull_request",
    repoFullName,
    repoId,
    installationId,
    prNumber,
    action,
    sender: {
      login: sender,
      id: payload.sender?.id || null,
    },
    head: {
      ref: headRef,
      sha: headSha,
      repoId: head?.repo?.id || null,
      repoFullName: head?.repo?.full_name || null,
    },
    base: {
      ref: baseRef,
      sha: baseSha,
      repoId: base?.repo?.id || null,
      repoFullName: base?.repo?.full_name || null,
    },
    isFromFork,
  };

  const headKey = headSha ? `-${headSha.substring(0, 7)}` : "";
  const jobId = `pr-${repoFullName.replace("/", "-")}-${prNumber}${headKey}`;

  try {
    await pullAnalysisQueue.add("analysis.pr", jobData, {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 1000 },
      priority: 3,
    });

    console.log(`Enqueued PR analysis: ${jobId}`);

    return {
      enqueued: true,
      repoFullName,
      prNumber,
      action,
      headSha,
      baseRef,
      headRef,
      jobId,
    };
  } catch (error) {
    console.error("Failed to enqueue PR analysis:", error);
    return {
      enqueued: false,
      error: error.message,
      repoFullName,
      prNumber,
    };
  }
}
