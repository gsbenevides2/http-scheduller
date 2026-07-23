import type { RedisClient } from "bun";
import { getEnv } from "@/app/utils/getEnv";

export class CacheClient {
  private static redisClient: RedisClient | null = null;

  private static getClient(): RedisClient {
    if (!this.redisClient) {
      const url = getEnv("REDIS_CACHE_URL");
      this.redisClient = new Bun.RedisClient(url);
    }
    return this.redisClient;
  }

  static async get(key: RedisClient.KeyLike): Promise<string | null> {
    const client = this.getClient();
    if (!client.connected) await client.connect();
    return client.get(key) as Promise<string | null>;
  }

  static async set(
    key: RedisClient.KeyLike,
    value: RedisClient.KeyLike,
  ): Promise<void> {
    const client = this.getClient();
    if (!client.connected) await client.connect();
    await client.set(key, value);
  }
}
