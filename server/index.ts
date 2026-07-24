import Elysia from "elysia";
import { openapi } from "@/server/openapi";
import { schedulledRequests } from "./modules/schedulled_requests";
import { telemetryRoutes } from "./modules/telemetry";
import { clientIds } from "./modules/client_ids";

export const app = new Elysia({ prefix: "/api" })
  .use(openapi)
  .use(schedulledRequests)
  .use(telemetryRoutes)
  .use(clientIds);
