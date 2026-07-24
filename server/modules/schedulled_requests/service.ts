import { db } from "@/server/db";
import { SchedulledRequest, SchedulledRequestsModel } from "./model";
import { schedulledRequests } from "@/server/db/schema";
import { inArray } from "drizzle-orm";
import { TelemetryService } from "@/server/modules/telemetry/service";
import { ClientIdsService } from "@/server/modules/client_ids/service";
import { loginInAuthentik } from "@/server/modules/authentik";
import { buildConflictUpdateColumns } from "@/server/utils/buildConflictUpdateColumns";

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
      .values(
        requests.map((r) => ({
          ...r,
          headers: r.headers ?? null,
        })),
      )
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
    console.log(`[Executing Request]: ${payload.method} ${payload.url}`);
    const MAX_BODY_BYTES = 64 * 1024;
    const start = Date.now();

    const TIMEOUT_MS = 15000;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const headers: Record<string, string> = payload.headers ?? {};

      if (payload.useAuthentikServiceAccount) {
        const urlObj = new URL(payload.url);
        const hostname = urlObj.hostname;
        const clientRecord = await ClientIdsService.getByHostname(hostname);
        if (clientRecord) {
          const tokenResponse = await loginInAuthentik({
            client_id: clientRecord.clientId,
          });
          headers["Authorization"] = `Bearer ${tokenResponse.access_token}`;
        }
      }

      const init: RequestInit = {
        method: payload.method,
        headers,
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
