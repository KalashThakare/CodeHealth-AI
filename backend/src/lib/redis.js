import { Queue } from "bullmq";
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

export const queueOptions = {
  connection,
  sharedConnection: true,
  defaultJobOptions: {
    removeOnComplete: {
      age: 60 * 10,  
      count: 50     
    },

    removeOnFail: {
      age: 60 * 30,  
      count: 20
    },

    attempts: 2,    
    backoff: {
      type: "exponential",
      delay: 1500,
    },

    stackTraceLimit: 1,
  },
};

export const webhookQueue = new Queue("webhooks", queueOptions);
// export const pushAnalysisQueue = new Queue("pushAnalysis", queueOptions);
export const pullAnalysisQueue = new Queue("pullAnalysis", queueOptions);
// export const issuesAnalysisQueue = new Queue("issuesAnalysis", queueOptions);
export const fullRepoAnalysisQueue = new Queue("fullRepoAnalysis", queueOptions);
export const filesQueue = new Queue("repoFiles", queueOptions);
export const pushScanQueue = new Queue("PushScan", queueOptions);
