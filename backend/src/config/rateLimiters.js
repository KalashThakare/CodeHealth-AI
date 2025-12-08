import { connection } from "../lib/redis.js";
import rateLimiter from "../middleware/rateLimiter.js";

export const fullRepoAnalysisLimiter = rateLimiter(connection, {
  windowMs: 120000,        // 2min
  maxRequests: 3,
  keyPrefix: 'full_repo_analysis_limit',
  message: 'Too many analysis requests. Please try again later.'
});

