import redis from "@/lib/db/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * A simple sliding window rate limiter using Redis.
 * @param identifier Unique identifier (e.g., IP address or user handle).
 * @param limit Maximum number of requests allowed in the window.
 * @param windowSeconds Duration of the window in seconds.
 */
export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 10
): Promise<RateLimitResult> {
  // If Redis is not available, allow all requests
  if (!redis) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowSeconds * 1000,
    };
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // Remove old requests outside the current window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in the current window
    const requestCount = await redis.zcard(key);

    if (requestCount >= limit) {
      // Get the oldest request to calculate reset time
      const oldestRequestArr = await redis.zrange(key, 0, 0, "WITHSCORES");
      const resetTime = oldestRequestArr.length > 1 
        ? parseInt(oldestRequestArr[1]) + windowSeconds * 1000 
        : now + windowSeconds * 1000;

      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Add current request
    await redis.zadd(key, now, now.toString());
    
    // Set expiration for the key
    await redis.expire(key, windowSeconds);

    return {
      success: true,
      limit,
      remaining: limit - (requestCount + 1),
      reset: now + windowSeconds * 1000,
    };
  } catch (error) {
    console.error("Rate limiter error:", error);
    // On Redis error, allow request but log error
    return {
      success: true,
      limit,
      remaining: 1,
      reset: now,
    };
  }
}
