import { schedulledRequests } from "@/server/db/schema";
import { createSelectSchema, createInsertSchema } from "drizzle-orm/zod";
import { UnwrapSchema } from "elysia";
import { z } from "zod";

export const SchedulledRequestsModel = {
  getSchedulledRequestsResponse: z.array(
    createSelectSchema(schedulledRequests, {
      externalId: () =>
        z.uuidv4().meta({
          title: "External ID",
          description: "The external ID of the http scheduller",
          example: crypto.randomUUID(),
        }),
      triggerType: (schema) =>
        schema.meta({
          title: "Trigger Type",
          description: "The trigger type of the http scheduller",
          example: "cron",
        }),
      excludeBeforeExecution: (schema) =>
        schema.meta({
          title: "Trigger Type",
          description: "The trigger type of the http scheduller",
          example: "cron",
        }),
      triggerValue: (schema) =>
        schema.meta({
          title: "Trigger Value",
          description: "The trigger value of the http scheduller",
          example: "0 0 * * *",
        }),
      url: () =>
        z.url().meta({
          title: "URL",
          description: "The URL of the http scheduller",
          example: "https://www.google.com",
        }),
      method: (schema) =>
        schema.meta({
          title: "Method",
          description: "The method of the http scheduller",
          example: "GET",
        }),
      headers: () =>
        z.record(z.string(), z.string()).meta({
          title: "Headers",
          description: "The headers of the http scheduller",
          example: {
            "Content-Type": "application/json",
          },
        }),
      body: (schema) =>
        schema.meta({
          title: "Body",
          description: "The body of the http scheduller",
          example: '{"name": "John", "age": 30}',
        }),
      useAuthentikServiceAccount: (schema) =>
        schema.meta({
          title: "Use Authentik Service Account",
          description:
            "Before send the request, autenticate in autthentik and send bearer header",
          example: false,
        }),
    }),
  ),
  createOrUpdateSchedulledRequestsBody: z.array(
    createInsertSchema(schedulledRequests, {
      externalId: () =>
        z.uuidv4().meta({
          title: "External ID",
          description: "The external ID of the http scheduller",
          example: crypto.randomUUID(),
        }),
      triggerType: (schema) =>
        schema.meta({
          title: "Trigger Type",
          description: "The trigger type of the http scheduller",
          example: "cron",
        }),
      excludeBeforeExecution: (schema) =>
        schema.meta({
          title: "Trigger Type",
          description: "The trigger type of the http scheduller",
          example: "cron",
        }),
      triggerValue: (schema) =>
        schema.meta({
          title: "Trigger Value",
          description: "The trigger value of the http scheduller",
          example: "0 0 * * *",
        }),
      url: () =>
        z.url().meta({
          title: "URL",
          description: "The URL of the http scheduller",
          example: "https://www.google.com",
        }),
      method: (schema) =>
        schema.meta({
          title: "Method",
          description: "The method of the http scheduller",
          example: "GET",
        }),
      headers: () =>
        z.record(z.string(), z.string()).meta({
          title: "Headers",
          description: "The headers of the http scheduller",
          example: {
            "Content-Type": "application/json",
          },
        }),
      body: (schema) =>
        schema.meta({
          title: "Body",
          description: "The body of the http scheduller",
          example: '{"name": "John", "age": 30}',
        }),
      useAuthentikServiceAccount: (schema) =>
        schema.meta({
          title: "Use Authentik Service Account",
          description:
            "Before send the request, autenticate in autthentik and send bearer header",
          example: false,
        }),
    }),
  ),
  deleteSchedulledRequestsBody: z.array(z.uuid()).meta({
    title: "List of UUIDs of schedulled requests",
    description: "List of UUIDs of schedulled requests",
    example: [crypto.randomUUID(), crypto.randomUUID()],
  }),
  executeRequestBody: createSelectSchema(schedulledRequests, {
    url: () =>
      z.url().meta({
        title: "URL",
        description: "The URL of the http scheduller",
        example: "https://www.google.com",
      }),
    method: (schema) =>
      schema.meta({
        title: "Method",
        description: "The method of the http scheduller",
        example: "GET",
      }),
    headers: () =>
      z.record(z.string(), z.string()).meta({
        title: "Headers",
        description: "The headers of the http scheduller",
        example: {
          "Content-Type": "application/json",
        },
      }),
    body: (schema) =>
      schema.meta({
        title: "Body",
        description: "The body of the http scheduller",
        example: '{"name": "John", "age": 30}',
      }),
    useAuthentikServiceAccount: (schema) =>
      schema.meta({
        title: "Use Authentik Service Account",
        description:
          "Before send the request, autenticate in autthentik and send bearer header",
        example: false,
      }),
  })
    .omit({
      createdAt: true,
      triggerType: true,
      triggerValue: true,
      excludeBeforeExecution: true,
    })
    .extend({
      externalId: z.uuidv4().optional().meta({
        title: "External ID",
        description: "The external ID of the http scheduller",
        example: crypto.randomUUID(),
      }),
    }),
  executeRequestResponse: z
    .object({
      ok: z.boolean().meta({
        title: "OK",
        description: "Whether the test request completed without throwing",
        example: true,
      }),
      status: z.number().min(100).max(900).meta({
        title: "HTTP Status",
        description: "The HTTP status code returned by the target",
        example: 200,
      }),
      body: z.string().meta({
        title: "Response Body",
        description: "The response body returned by the target (truncated)",
        example: JSON.stringify({ ok: "Olá" }),
      }),
      timeMs: z.number().meta({
        title: "Time (ms)",
        description: "Elapsed time of the test request in milliseconds",
        example: 200,
      }),
      error: z.optional(
        z.string().meta({
          title: "Error",
          description: "Error message if the test request failed to complete",
        }),
      ),
    })
    .meta({
      title: "Test Response",
      description: "Result of dispatching a test http scheduller request",
    }),
};

export type SchedulledRequestsModel = {
  [k in keyof typeof SchedulledRequestsModel]: UnwrapSchema<
    (typeof SchedulledRequestsModel)[k]
  >;
};

export type SchedulledRequest = typeof schedulledRequests.$inferSelect;

export type SchedulledRequestMethods =
  typeof schedulledRequests.$inferSelect.method;

export type SchedulledRequestHeaders =
  typeof schedulledRequests.$inferSelect.headers;
