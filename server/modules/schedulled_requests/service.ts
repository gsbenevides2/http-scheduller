import { db } from "@/server/db";
import { SchedulledRequest, SchedulledRequestsModel } from "./model";
import { schedulledRequests } from "@/server/db/schema";
import { getColumns, inArray, SQL, sql } from "drizzle-orm";
import { TelemetryService } from "@/server/modules/telemetry/service";
import { PgTable } from "drizzle-orm/pg-core";

const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column].name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

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
    await db
      .insert(schedulledRequests)
      .values(requests)
      .onConflictDoUpdate({
        target: schedulledRequests.externalId,
        set: buildConflictUpdateColumns(schedulledRequests, [
          "body",
          "excludeBeforeExecution",
          "headers",
          "triggerType",
          "triggerValue",
          "url",
          "useAuthentikServiceAccount",
        ]),
      });
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
    schedulerExternalId?: string,
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

      const result = {
        ok: response.ok,
        status: response.status,
        body: truncated,
        timeMs: Date.now() - start,
      };

      await TelemetryService.create({
        schedulerExternalId: schedulerExternalId ?? null,
        requestUrl: payload.url,
        requestMethod: payload.method,
        requestHeaders: payload.headers ?? null,
        requestBody: payload.body ?? null,
        responseBody: truncated,
        responseStatus: response.status,
        responseTimeMs: result.timeMs,
        errorMessage: null,
        success: response.ok,
        executedAt: new Date(),
      });

      return result;
    } catch (err) {
      const timeMs = Date.now() - start;
      const errorMessage = err instanceof Error ? err.message : String(err);

      await TelemetryService.create({
        schedulerExternalId: schedulerExternalId ?? null,
        requestUrl: payload.url,
        requestMethod: payload.method,
        requestHeaders: payload.headers ?? null,
        requestBody: payload.body ?? null,
        responseBody: null,
        responseStatus: 0,
        responseTimeMs: timeMs,
        errorMessage,
        success: false,
        executedAt: new Date(),
      });

      return {
        ok: false,
        status: 0,
        body: "",
        timeMs,
        error: errorMessage,
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
