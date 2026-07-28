import type { RedisClient } from "bun";
import { getEnv } from "@/app/utils/getEnv";

const DEFAULT_TTL_SECONDS = 86400;

export class CacheClient {
  private static redisClient: RedisClient | null = null;
  private static connectionFailed = false;

  private static getClient(): RedisClient | null {
    if (this.connectionFailed) return null;
    if (!this.redisClient) {
      try {
        const url = getEnv("REDIS_CACHE_URL");
        this.redisClient = new Bun.RedisClient(url);
      } catch (err) {
        console.warn("[CacheClient] Failed to create Redis client:", err);
        this.connectionFailed = true;
        return null;
      }
    }
    return this.redisClient;
  }

  static async get(key: RedisClient.KeyLike): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      if (!client.connected) await client.connect();
      return client.get(key) as Promise<string | null>;
    } catch (err) {
      console.warn("[CacheClient] GET failed:", err);
      return null;
    }
  }

  static async set(
    key: RedisClient.KeyLike,
    value: RedisClient.KeyLike,
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    try {
      if (!client.connected) await client.connect();
      await client.set(key, value, "EX", ttlSeconds);
    } catch (err) {
      console.warn("[CacheClient] SET failed:", err);
    }
  }
}
