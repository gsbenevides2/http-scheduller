import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import HttpSchedullerController from "./HttpScheduller";
import { getProjectInfo } from "@/app/utils/getProjectInfo";

export const app = new Elysia({ prefix: "/api" })
  .use(
    openapi({
      documentation: {
        info: getProjectInfo(),
      },
    }),
  )
  .use(HttpSchedullerController);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;
