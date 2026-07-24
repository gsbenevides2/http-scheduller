import { telemetry } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-orm/zod";
import { UnwrapSchema } from "elysia";
import { z } from "zod";

export const TelemetryModel = {
  getTelemetryResponse: z.object({
    records: z.array(
      createSelectSchema(telemetry, {
        id: (schema) =>
          schema.meta({
            title: "ID",
            description: "Telemetry record ID",
            example: 1,
          }),
        schedulerExternalId: (schema) =>
          schema.meta({
            title: "Scheduler External ID",
            description: "The external ID of the scheduler that triggered this request",
            example: crypto.randomUUID(),
          }),
        requestName: (schema) =>
          schema.meta({
            title: "Request Name",
            description: "The name given to the scheduled request",
            example: "Health Check",
          }),
        requestUrl: (schema) =>
          schema.meta({
            title: "Request URL",
            description: "The URL that was called",
            example: "https://api.example.com/health",
          }),
        requestMethod: (schema) =>
          schema.meta({
            title: "Request Method",
            description: "The HTTP method used",
            example: "GET",
          }),
        requestHeaders: (schema) =>
          schema.meta({
            title: "Request Headers",
            description: "The headers sent with the request",
          }),
        requestBody: (schema) =>
          schema.meta({
            title: "Request Body",
            description: "The body sent with the request",
          }),
        responseBody: (schema) =>
          schema.meta({
            title: "Response Body",
            description: "The response body received",
          }),
        responseStatus: (schema) =>
          schema.meta({
            title: "Response Status",
            description: "The HTTP status code received",
            example: 200,
          }),
        responseTimeMs: (schema) =>
          schema.meta({
            title: "Response Time (ms)",
            description: "Time taken for the request in milliseconds",
            example: 150,
          }),
        errorMessage: (schema) =>
          schema.meta({
            title: "Error Message",
            description: "Error message if the request failed",
          }),
        success: (schema) =>
          schema.meta({
            title: "Success",
            description: "Whether the request was successful",
            example: true,
          }),
        executedAt: (schema) =>
          schema.meta({
            title: "Executed At",
            description: "When the request was executed",
          }),
      }),
    ),
    total: z.number().meta({
      title: "Total Records",
      description: "Total number of telemetry records matching the filter",
      example: 100,
    }),
  }),
  getTelemetryStatsResponse: z.object({
    total: z.number().meta({
      title: "Total Requests",
      description: "Total number of telemetry records",
      example: 100,
    }),
    successCount: z.number().meta({
      title: "Success Count",
      description: "Number of successful requests",
      example: 85,
    }),
    errorCount: z.number().meta({
      title: "Error Count",
      description: "Number of failed requests",
      example: 15,
    }),
    averageTimeMs: z.number().meta({
      title: "Average Response Time (ms)",
      description: "Average response time across all requests",
      example: 200,
    }),
  }),
  deleteTelemetryBody: z.array(z.number()).meta({
    title: "List of Telemetry IDs",
    description: "List of telemetry record IDs to delete",
    example: [1, 2, 3],
  }),
};

export type TelemetryModel = {
  [k in keyof typeof TelemetryModel]: UnwrapSchema<
    (typeof TelemetryModel)[k]
  >;
};

export type TelemetryRecord = typeof telemetry.$inferSelect;
