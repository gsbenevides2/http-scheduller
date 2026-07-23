import { db } from "@/server/db";
import { clientIds } from "@/server/db/schema";
import { inArray, sql } from "drizzle-orm";
import {
  ClientIdsModel,
  CreateOrUpdateClientIdBody,
} from "./model";

export class ClientIdsService {
  static async getAll(): Promise<ClientIdsModel["getClientIdsResponse"]> {
    return db.query.clientIds.findMany();
  }

  static async getByHostname(
    hostname: string,
  ): Promise<{ hostname: string; clientId: string } | undefined> {
    return db.query.clientIds.findFirst({
      where: { hostname },
    });
  }

  static async createOrUpdate(
    items: CreateOrUpdateClientIdBody,
  ): Promise<void> {
    await db
      .insert(clientIds)
      .values(
        items.map((item) => ({
          hostname: item.hostname,
          clientId: item.clientId,
        })),
      )
      .onConflictDoUpdate({
        target: clientIds.hostname,
        set: {
          clientId: sql.raw(`excluded."client_id"`),
        },
      });
  }

  static async deleteMany(hostnames: string[]): Promise<void> {
    await db
      .delete(clientIds)
      .where(inArray(clientIds.hostname, hostnames));
  }
}
