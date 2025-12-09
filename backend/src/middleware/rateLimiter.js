function rateLimiter(redisClient, options = {}) {
  const {
    windowMs = 60000, // 1 minute
    maxRequests = 100,
    keyPrefix = 'rate_limit',
    message = 'Too many requests, please try again later.'
  } = options;

  return async (req, res, next) => {
    try {
      
      const identifier = req.user?.id;
      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      await redisClient.zremrangebyscore(key, 0, windowStart);
      const requestCount = await redisClient.zcard(key);

      if (requestCount >= maxRequests) {
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: message
        });
      }

      await redisClient.zadd(key, now, now.toString());
      
      await redisClient.expire(key, Math.ceil(windowMs / 1000));

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - requestCount - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
}

export default rateLimiter;