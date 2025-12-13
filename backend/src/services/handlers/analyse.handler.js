import axios from "axios";

const DEADLINE_MS = 300000; // 5 minutes

export async function fullRepoAnalyse(payload) {
  try {
    const repoId = payload.repoId;
    const owner = payload.owner;
    const repoName = payload.repoName;
    const fullName = `${owner}/${repoName}`;
    const defaultBranch = payload.defaultBranch || "main";
    const installationId = payload.installationId;
    const requestedBy = payload.requestedBy || "manual";
    const requestedAt = payload.requestedAt || new Date().toISOString();

    console.log("[analyse] processing request", {
      repoId,
      fullName,
      branch: defaultBranch,
      installationId,
      requestedBy,
    });

    if (!repoId || !owner || !repoName || !fullName || !defaultBranch || !installationId) {
      throw new Error(
        `Invalid payload: repoId=${repoId} owner=${owner} repoName=${repoName} fullName=${fullName} defaultBranch=${defaultBranch} installationId=${installationId}`
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("deadline"), DEADLINE_MS);

    try {
      const url = `${process.env.ANALYSIS_INTERNAL_URL}/v1/internal/analysis/full-repo`;
      const runPayload = {
        repoId,
        owner,
        repoName,
        fullName,
        branch: defaultBranch,
        installationId,
        requestedBy,
        requestedAt,
      };

      console.log("[analyse] dispatching to internal service", { url, repoId, fullName });

      const { data } = await axios.post(url, runPayload, {
        timeout: Math.min(DEADLINE_MS - 1000, 290000),
        signal: controller.signal,
      });

      console.log("[analyse] completed", {
        repoId,
        fullName,
        score: data?.score,
        runId: data?.runId,
      });

      return {
        ok: true,
        repoId,
        fullName,
        branch: defaultBranch,
        requestedBy,
        score: data?.score ?? null,
        summary: data?.message ?? null,
        findings: data?.findings ?? null,
        runId: data?.runId ?? null,
      };
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.error("[analyse] error", error);
    return {
      ok: false,
      error: String(error),
      repoId: payload.repoId || null,
      fullName: payload.owner && payload.repoName ? `${payload.owner}/${payload.repoName}` : null,
    };
  }
}