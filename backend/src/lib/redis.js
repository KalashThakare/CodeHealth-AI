import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: "default",
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

export const webhookQueue = new Queue("webhooks", { connection });
export const pushAnalysisQueue = new Queue("pushAnalysis", {connection});
export const pullAnalysisQueue = new Queue("pullAnalysis", {connection});
export const issuesAnalysisQueue = new Queue("issuesAnalysis", {connection});
export const fullRepoAnalysisQueue = new Queue("fullRepoAnalysis",{connection});
export const filesQueue = new Queue("repoFiles",{connection});
export const pushScanQueue = new Queue("PushScan", {connection});
// export const scannigQueue = new Queue("scanning", {connection});

