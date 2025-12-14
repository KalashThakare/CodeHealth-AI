import axios from "axios";
import PullRequestAnalysis from "../database/models/pr_analysis_metrics.js";
import dotenv from "dotenv";
import { Project } from "../database/models/project.js";
dotenv.config();

const DEADLINE_MS = Number(process.env.ANALYSIS_DEADLINE_MS || 15 * 60 * 1000);

export async function analyzePullRequest(payload) {
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
  } = payload;

  if (!repoFullName || !installationId || !prNumber || !head || !base) {
    throw new Error(
      `Invalid payload: repo=${repoFullName} installationId=${installationId} prNumber=${prNumber} head=${!!head} base=${!!base}`
    );
  }

  const headSha = head.sha || null;
  const baseSha = base.sha || null;
  const headRef = head.ref || null;
  const baseRef = base.ref || null;

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
}