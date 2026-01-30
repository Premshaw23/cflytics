import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error getting from cache (${key}):`, error);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  try {
    const data = JSON.stringify(value);
    await redis.set(key, data, "EX", ttlSeconds);
  } catch (error) {
    console.error(`Error setting cache (${key}):`, error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Error deleting cache (${key}):`, error);
  }
}

export default redis;
