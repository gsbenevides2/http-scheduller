import Elysia, { StatusMap } from "elysia";
import { TelemetryModel } from "./model";
import { TelemetryService } from "./service";
import z from "zod";

export const telemetryRoutes = new Elysia({
  prefix: "/telemetry",
  detail: {
    tags: ["Telemetry"],
  },
})
  .get(
    "/",
    async ({ query }) => {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 50;
      const schedulerExternalId = query.schedulerExternalId || undefined;
      return TelemetryService.getAll(page, limit, schedulerExternalId);
    },
    {
      query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        schedulerExternalId: z.string().optional(),
      }),
      response: {
        [StatusMap.OK]: TelemetryModel.getTelemetryResponse,
      },
      detail: {
        summary: "Get Telemetry Records",
        description: "Returns telemetry records with pagination and optional scheduler filter.",
      },
    },
  )
  .get(
    "/stats",
    async ({ query }) => {
      const schedulerExternalId = query.schedulerExternalId || undefined;
      return TelemetryService.getStats(schedulerExternalId);
    },
    {
      query: z.object({
        schedulerExternalId: z.string().optional(),
      }),
      response: {
        [StatusMap.OK]: TelemetryModel.getTelemetryStatsResponse,
      },
      detail: {
        summary: "Get Telemetry Stats",
        description: "Returns aggregate telemetry statistics.",
      },
    },
  )
  .delete(
    "/",
    async ({ body }) => {
      await TelemetryService.deleteMany(body);
      return;
    },
    {
      detail: {
        summary: "Delete Telemetry Records",
        description: "Delete telemetry records by their IDs.",
      },
      body: TelemetryModel.deleteTelemetryBody,
      response: {
        [StatusMap["No Content"]]: z.undefined(),
      },
    },
  )
  .delete(
    "/clear",
    async () => {
      await TelemetryService.clearAll();
      return;
    },
    {
      detail: {
        summary: "Clear All Telemetry",
        description: "Delete all telemetry records.",
      },
      response: {
        [StatusMap["No Content"]]: z.undefined(),
      },
    },
  )
  .delete(
    "/cleanup",
    async ({ query }) => {
      const days = Number(query.days) || 30;
      const deleted = await TelemetryService.cleanOlderThan(days);
      return { deleted };
    },
    {
      query: z.object({
        days: z.string().optional(),
      }),
      detail: {
        summary: "Cleanup Old Telemetry",
        description: "Delete telemetry records older than N days (default: 30).",
      },
    },
  );
