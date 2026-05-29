import { Collection, MongoClient, type ObjectId } from "mongodb";
import { CronnerService } from "./Cronner";
import { getEnv } from "../utils/getEnv";

export interface HttpScheduller {
  externalId: string;
  triggerType: "cron" | "date";
  excludeBeforeExecution: boolean;
  triggerValue: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers: Record<string, string>;
  body: string;
}

type WithIdHttpScheduller = HttpScheduller & {
  _id: ObjectId;
};

function removeInternalId(httpScheduller: WithIdHttpScheduller) {
  const { _id, ...rest } = httpScheduller;
  return rest;
}

export class HttpSchedullerService {
  static mongoClient: MongoClient | null = null;
  static db: ReturnType<MongoClient["db"]> | null = null;
  static collection: Collection<WithIdHttpScheduller>;
  static async getCoolection() {
    if (!this.mongoClient || !this.db) {
      const mongoClient = await MongoClient.connect(
        getEnv("MONGO_URI", false),
        {
          authSource: "http-scheduller",
        },
      );

      const db = mongoClient.db("http-scheduller");
      const collection = db.collection<WithIdHttpScheduller>("http-scheduller");
      this.mongoClient = mongoClient;
      this.db = db;
      this.collection = collection;
      return collection;
    }
    return this.collection;
  }

  static async deleteMany(ids: string[]) {
    const collection = await this.getCoolection();
    await collection.deleteMany({
      externalId: {
        $in: ids,
      },
    });
    for (const id of ids) {
      await CronnerService.removeJob(id);
    }
  }
  static async getAll() {
    const collection = await this.getCoolection();
    const httpScheduller = await collection.find({}).toArray();
    return httpScheduller.map(removeInternalId);
  }
  static async createOrUpdateMany(httpScheduller: HttpScheduller[]) {
    const collection = await this.getCoolection();
    for (const http of httpScheduller) {
      await collection.updateOne(
        {
          externalId: http.externalId,
        },
        {
          $set: http,
        },
        {
          upsert: true,
        },
      );
      await CronnerService.addJob({
        id: http.externalId,
        type: http.triggerType,
        triggerValue: http.triggerValue,
      });
    }
  }
  static async getById(id: string) {
    const collection = await this.getCoolection();
    const httpScheduller = await collection.findOne({
      externalId: id,
    });
    return httpScheduller ? removeInternalId(httpScheduller) : null;
  }
  static async deleteById(id: string) {
    const collection = await this.getCoolection();
    await collection.deleteOne({
      externalId: id,
    });
  }

  static async testRequest(payload: {
    url: string;
    method: HttpScheduller["method"];
    headers: Record<string, string>;
    body: string;
  }) {
    const MAX_BODY_BYTES = 64 * 1024;
    const start = Date.now();
    try {
      const init: RequestInit = {
        method: payload.method,
        headers: payload.headers,
      };
      if (payload.method !== "GET" && payload.body) {
        init.body = payload.body;
      }
      const response = await fetch(payload.url, init);
      const raw = await response.text();
      const truncated =
        raw.length > MAX_BODY_BYTES
          ? raw.slice(0, MAX_BODY_BYTES) + "\n…[truncated]"
          : raw;
      return {
        ok: response.ok,
        status: response.status,
        body: truncated,
        timeMs: Date.now() - start,
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        body: "",
        timeMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
