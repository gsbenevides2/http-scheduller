import { defineRelations, sql } from "drizzle-orm";
import {
  boolean,
  json,
  pgEnum,
  pgTable,
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

export const relations = defineRelations({ schedulledRequests });
