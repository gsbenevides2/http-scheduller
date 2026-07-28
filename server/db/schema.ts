import { defineRelations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { httpMethods } from "../utils/httpMethods";

export const triggerTypeEnum = pgEnum("trigger_type", ["date", "cron"]);

export const methodEnum = pgEnum("method", httpMethods);

export const schedulledRequests = pgTable("schedulled_requests", {
  externalId: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  triggerType: triggerTypeEnum().notNull(),
  excludeBeforeExecution: boolean().notNull().default(false),
  triggerValue: text().notNull(),
  url: text().notNull(),
  method: methodEnum().notNull().default("GET"),
  headers: json().$type<Record<string, string>>(),
  body: text(),
  createdAt: timestamp({ mode: "date" })
    .notNull()
    .default(sql`now()`),
  useAuthentikServiceAccount: boolean().default(false),
});

export const telemetry = pgTable(
  "telemetry",
  {
    id: serial().primaryKey(),
    schedulerExternalId: text(),
    requestName: text(),
    requestUrl: text().notNull(),
    requestMethod: text().notNull(),
    requestHeaders: json().$type<Record<string, string>>(),
    requestBody: text(),
    responseBody: text(),
    responseStatus: integer(),
    responseTimeMs: integer(),
    errorMessage: text(),
    success: boolean().notNull().default(false),
    executedAt: timestamp({ mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("telemetry_scheduler_external_id_idx").on(table.schedulerExternalId),
    index("telemetry_executed_at_idx").on(table.executedAt),
  ],
);

export const clientIds = pgTable("client_ids", {
  hostname: text().primaryKey(),
  clientId: text().notNull(),
  createdAt: timestamp({ mode: "date" })
    .notNull()
    .default(sql`now()`),
});

export const relations = defineRelations({ schedulledRequests, telemetry, clientIds });
