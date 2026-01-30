import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;
let redisAvailable = false;

// Only initialize Redis if REDIS_URL is explicitly set
if (redisUrl && redisUrl !== "redis://localhost:6379") {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          redisAvailable = false;
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      },
    });

    redis.on("error", () => {
      // Silently mark Redis as unavailable
      redisAvailable = false;
    });

    redis.on("connect", () => {
      console.log("✓ Redis connected successfully");
      redisAvailable = true;
    });
  } catch (error) {
    redisAvailable = false;
  }
} else {
  console.log("ℹ Redis not configured - running without cache");
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!redis || !redisAvailable) return null;
  
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`Cache read failed for ${key} - continuing without cache`);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  if (!redis || !redisAvailable) return;
  
  try {
    const data = JSON.stringify(value);
    await redis.set(key, data, "EX", ttlSeconds);
  } catch (error) {
    console.warn(`Cache write failed for ${key} - continuing without cache`);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis || !redisAvailable) return;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`Cache delete failed for ${key}`);
  }
}

export default redis;
