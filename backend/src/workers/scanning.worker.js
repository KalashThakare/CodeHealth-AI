import axios from "axios";
import { QueueEvents, Worker } from "bullmq";
import { connection } from "../lib/redis.js";
import dotenv from "dotenv";
import { analyzeFile } from "../utils/AST.js";
import RepoFileMetrics  from "../database/models/repoFileMetrics.js";
import { Project } from "../database/models/project.js";
dotenv.config();

const CONCURRENCY = Number(process.env.ANALYSIS_CONCURRENCY || 4);
const DEADLINE_MS = Number(process.env.ANALYSIS_DEADLINE_MS || 15 * 60 * 1000);

