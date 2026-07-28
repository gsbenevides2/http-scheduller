import { db } from "@/server/db";
import { telemetry } from "@/server/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { TelemetryModel } from "./model";

export class TelemetryService {
  static async getAll(
    page: number = 1,
    limit: number = 50,
    schedulerExternalId?: string,
  ): Promise<TelemetryModel["getTelemetryResponse"]> {
    const offset = (page - 1) * limit;

    const conditions = schedulerExternalId
      ? eq(telemetry.schedulerExternalId, schedulerExternalId)
      : undefined;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(telemetry)
      .where(conditions);

    const records = await db
      .select()
      .from(telemetry)
      .where(conditions)
      .orderBy(sql`${telemetry.executedAt} DESC`)
      .limit(limit)
      .offset(offset);

    return {
      records,
      total: totalResult?.count ?? 0,
    };
  }

  static async getStats(
    schedulerExternalId?: string,
  ): Promise<TelemetryModel["getTelemetryStatsResponse"]> {
    const conditions = schedulerExternalId
      ? eq(telemetry.schedulerExternalId, schedulerExternalId)
      : undefined;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(telemetry)
      .where(conditions);

    const [successResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(telemetry)
      .where(
        conditions
          ? and(conditions, eq(telemetry.success, true))
          : eq(telemetry.success, true),
      );

    const [avgResult] = await db
      .select({ avg: sql<number>`coalesce(avg(${telemetry.responseTimeMs}), 0)::int` })
      .from(telemetry)
      .where(conditions);

    const total = totalResult?.count ?? 0;
    const successCount = successResult?.count ?? 0;

    return {
      total,
      successCount,
      errorCount: total - successCount,
      averageTimeMs: avgResult?.avg ?? 0,
    };
  }

  static async create(
    record: OTelemetryInsert,
  ): Promise<void> {
    await db.insert(telemetry).values({
      ...record,
      requestHeaders: record.requestHeaders != null ? sql`${JSON.stringify(record.requestHeaders)}::jsonb` : null,
    });
  }

  static async deleteMany(ids: number[]): Promise<void> {
    await db.delete(telemetry).where(inArray(telemetry.id, ids));
  }

  static async clearAll(): Promise<void> {
    await db.delete(telemetry);
  }

  static async cleanOlderThan(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const result = await db
      .delete(telemetry)
      .where(sql`${telemetry.executedAt} < ${cutoff}`)
      .returning({ id: telemetry.id });
    return result.length;
  }
}

type OTelemetryInsert = typeof telemetry.$inferInsert;
