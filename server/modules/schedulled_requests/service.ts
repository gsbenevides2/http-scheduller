import { db } from "@/server/db";
import { SchedulledRequest, SchedulledRequestsModel } from "./model";
import { schedulledRequests } from "@/server/db/schema";
import { inArray } from "drizzle-orm";
import { TelemetryService } from "@/server/modules/telemetry/service";
import { ClientIdsService } from "@/server/modules/client_ids/service";
import { loginInAuthentik } from "@/server/modules/authentik";
import { buildConflictUpdateColumns } from "@/server/utils/buildConflictUpdateColumns";
import { validateUrl } from "@/server/utils/ssrfProtection";

const MAX_REDIRECTS = 10;

async function safeFetch(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let currentUrl = url;
  let redirects = 0;

  while (true) {
    await validateUrl(currentUrl);
    const response = await fetch(currentUrl, { ...init, redirect: "manual" });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response;

      redirects++;
      if (redirects > MAX_REDIRECTS) {
        throw new Error(`Too many redirects (max ${MAX_REDIRECTS})`);
      }

      const resolved = new URL(location, currentUrl).toString();
      currentUrl = resolved;
      continue;
    }

    return response;
  }
}

async function readBodyWithLimit(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<string> {
  if (!body) return "";
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (total + value.length > maxBytes) {
      const remaining = maxBytes - total;
      if (remaining > 0) chunks.push(value.slice(0, remaining));
      truncated = true;
      reader.cancel();
      break;
    }
    chunks.push(value);
    total += value.length;
  }

  const decoder = new TextDecoder();
  const text = decoder.decode(new Uint8Array(chunks.reduce((a, c) => a + c.length, 0) > 0 ? concatChunks(chunks) : new Uint8Array(0)));
  return truncated ? text + "\n…[truncated]" : text;
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((a, c) => a + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

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
          "name",
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
    await validateUrl(payload.url);
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

      const response = await safeFetch(payload.url, init);
      const truncated = await readBodyWithLimit(response.body, MAX_BODY_BYTES);

      const result = {
        ok: response.ok,
        status: response.status,
        body: truncated,
        timeMs: Date.now() - start,
      };

      await TelemetryService.create({
        schedulerExternalId: schedulerExternalId ?? null,
        requestName: payload.name ?? null,
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
        requestName: payload.name ?? null,
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
