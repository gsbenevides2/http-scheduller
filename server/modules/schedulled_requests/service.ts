import { db } from "@/server/db";
import { SchedulledRequest, SchedulledRequestsModel } from "./model";
import { schedulledRequests } from "@/server/db/schema";
import { inArray } from "drizzle-orm";

export class SchedulledRequests {
  static async getAll(): Promise<
    SchedulledRequestsModel["getSchedulledRequestsResponse"]
  > {
    const response = db.query.schedulledRequests.findMany();
    return response;
  }

  static async createOrUpdate(
    requests: SchedulledRequestsModel["createOrUpdateSchedulledRequestsBody"],
  ): Promise<void> {
    await db.insert(schedulledRequests).values(requests);
  }
  static async deleteMany(uuids: string[]) {
    await db
      .delete(schedulledRequests)
      .where(inArray(schedulledRequests.externalId, uuids));
  }
  static async exists(uuid: string): Promise<boolean> {
    const response = await db.query.schedulledRequests.findFirst({
      where: {
        externalId: uuid,
      },
    });
    return Boolean(response);
  }
  static async executeRequest(
    payload: SchedulledRequestsModel["executeRequestBody"],
  ): Promise<SchedulledRequestsModel["executeRequestResponse"]> {
    const MAX_BODY_BYTES = 64 * 1024;
    const start = Date.now();

    const TIMEOUT_MS = 15000;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const init: RequestInit = {
        method: payload.method,
        headers: payload.headers ?? undefined,
        signal: controller.signal,
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
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
  static async getById(uuid: string): Promise<SchedulledRequest | undefined> {
    const request = await db.query.schedulledRequests.findFirst({
      where: {
        externalId: uuid,
      },
    });
    return request;
  }
}
