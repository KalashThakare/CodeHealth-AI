import { connection } from "../lib/redis.js";
import rateLimiter from "../middleware/rateLimiter.js";

export const fullRepoAnalysisLimiter = rateLimiter(connection, {
  windowMs: 60000,        
  maxRequests: 10,
  keyPrefix: 'full_repo_analysis_limit',
  message: 'Too many analysis requests. Please try again later.'
});

export const importProjectsLimit = rateLimiter(connection, {
  windowMs:15000,
  maxRequests:1,
  keyPrefix:"Import project limit",
  message:"Please wait while we process."
})