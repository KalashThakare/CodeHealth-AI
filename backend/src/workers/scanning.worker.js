import axios from "axios";
import {  QueueEvents, Worker } from "bullmq";
import { connection } from "../lib/redis.js";
import dotenv from "dotenv";
import { analyzeFile } from "../utils/AST.js";
import RepoFileMetrics  from "../database/models/repoFileMetrics.js";
import { Project } from "../database/models/project.js";
dotenv.config();

const CONCURRENCY = Number(process.env.ANALYSIS_CONCURRENCY || 4);
const DEADLINE_MS = Number(process.env.ANALYSIS_DEADLINE_MS || 15 * 60 * 1000);

export const ScanPushWorker = new Worker(
    "PushScan",
    async job=>{
        console.log("PushScan worker recieved job", {id:job.id, name: job.name});

        if(job.name !== "Scan"){
            return{skipped:true, reason:"unknown", name:job.name}
        }

        const {repoId, added, modified, commitSha, repo, installationId, branch} = job.data || {};
        if(!added || !modified || !repoId || !commitSha || !repo || !installationId || !branch){
            throw new Error("Invalid job, data fields are missing");
        }

        const controller = new AbortController();
        const timer = setTimeout(()=>controller.abort("deadline"), DEADLINE_MS);

        const payload = {
            repoId,
            installationId,
            repoName:repo,
            commitSha,
            branch,
            filesAdded: Array.from(added),      
            filesModified: Array.from(modified),   
        }

        try{

            const url = process.env.ANALYSIS_INTERNAL_URL + "/v3/internal/pushScan/run";
            const {data} = await axios.post(url, payload, {
                timeout:10_000,
                signal:controller.signal
            });

            return{
                ok:true,
                data
            };

        }finally{
            clearTimeout(timer);
        }
    },
    { connection, concurrency: CONCURRENCY }
);

ScanPushWorker.on("ready", () => console.log("[scan] worker ready"));
ScanPushWorker.on("error", err => console.error("[scan] worker error", err));
ScanPushWorker.on("failed", (job, err) => console.error(`[scan] job failed ${job?.id}`, err));
ScanPushWorker.on("completed", job => console.log(`[scan] job completed ${job.id}`));

// Queue event listeners
const scanEvents = new QueueEvents("PushScan", { connection });

scanEvents.on("waiting", ({ jobId }) => console.log("[scan] waiting", jobId));
scanEvents.on("active", ({ jobId }) => console.log("[scan] active", jobId));
scanEvents.on("completed", ({ jobId }) => console.log("[scan] completed", jobId));
scanEvents.on("failed", ({ jobId, failedReason }) => console.error("[scan] failed", jobId, failedReason));

scanEvents.on("stalled", ({ jobId }) => console.warn("[scan] stalled", jobId));
scanEvents.on("progress", ({ jobId, data }) => console.log("[scan] progress", jobId, data));