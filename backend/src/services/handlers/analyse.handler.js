import { fullRepoAnalysisQueue } from "../../lib/redis.js";

export async function handleAnalyse(payload){

    try {
        const repoId = payload.repoId;
        const owner = payload.owner;
        const repoName = payload.repoName;
        const fullName = `${owner}/${repoName}`;
        const defaultBranch = payload.defaultBranch || "main";
        const installationId = payload.installationId;
        const requestedBy = payload.requestedBy || "manual";

        console.log("[analyse] enqueue request", { 
            repoId, 
            fullName, 
            branch: defaultBranch, 
            installationId,
            requestedBy 
        });

        const jobData = {
            repoId,
            owner,
            repoName,
            fullName,
            defaultBranch,
            installationId,
            requestedBy,
            requestedAt: new Date().toISOString()
        };

        const baseId = `analysis-${fullName}-${defaultBranch}-${Date.now()}`;
        const safeId = baseId.replace(/[^\w.-]/g, "_");

        const job = await fullRepoAnalysisQueue.add("fullRepoAnalysis", jobData, {
            jobId: safeId,
            attempts: 3,
            backoff: 'exponential',
            removeOnComplete: 10,
            removeOnFail: 5,
            timeout: 300000 
        });

        const state = await job.getState();
        const counts = await fullRepoAnalysisQueue.getJobCounts();

        console.log("[analyse] enqueued", { 
            id: job.id, 
            state, 
            counts,
            repoId,
            fullName
        });

        return { 
            enqueued: true, 
            id: job.id, 
            state, 
            repoId,
            fullName,
            branch: defaultBranch 
        };

    } catch (error) {
        console.error("[analyse] enqueue error", error);
        return { 
            enqueued: false, 
            error: String(error),
            repoId: payload.repoId || null 
        };
    }

}