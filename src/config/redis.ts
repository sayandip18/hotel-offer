import Redis from "ioredis";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (redisClient) return redisClient;

  redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    retryStrategy(times) {
      if (times >= 3) {
        console.error("[Redis] Max retry attempts reached. Giving up.");
        return null;
      }
      const delay = Math.min(times * 500, 2000);
      console.warn(
        `[Redis] Retrying connection... attempt ${times} (delay: ${delay}ms)`,
      );
      return delay;
    },
  });

  redisClient.on("connect", () => {
    console.log("[Redis] Connected successfully");
  });

  redisClient.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  redisClient.on("close", () => {
    console.warn("[Redis] Connection closed");
  });

  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("[Redis] Disconnected cleanly");
  }
};
