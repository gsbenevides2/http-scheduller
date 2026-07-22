import Elysia from "elysia";
import { openapi } from "@/server/openapi";
import { schedulledRequests } from "./modules/schedulled_requests";

export const app = new Elysia({ prefix: "/api" })
  .use(openapi)
  .use(schedulledRequests);
