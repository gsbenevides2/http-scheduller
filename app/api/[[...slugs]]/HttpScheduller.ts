import {
  HttpScheduller,
  HttpSchedullerService,
} from "@/app/services/HttpScheduller";
import { Elysia, StatusMap, t } from "elysia";

const httpSchedullerSchema = t.Object({
  externalId: t.String({
    title: "External ID",
    description: "The external ID of the http scheduller",
    example: "1234567890",
  }),
  triggerType: t.Union([t.Literal("cron"), t.Literal("date")], {
    title: "Trigger Type",
    description: "The trigger type of the http scheduller",
    example: "cron",
  }),
  excludeBeforeExecution: t.Boolean({
    title: "Exclude Before Execution",
    description: "If the http scheduller should exclude before execution",
    example: true,
  }),
  triggerValue: t.String({
    title: "Trigger Value",
    description: "The trigger value of the http scheduller",
    example: "0 0 * * *",
  }),
  url: t.String({
    title: "URL",
    description: "The URL of the http scheduller",
    example: "https://www.google.com",
  }),

  method: t.Union(
    [
      t.Literal("GET"),
      t.Literal("POST"),
      t.Literal("PUT"),
      t.Literal("DELETE"),
      t.Literal("PATCH"),
    ],
    {
      title: "Method",
      description: "The method of the http scheduller",
      example: "GET",
    },
  ),
  headers: t.Record(t.String(), t.String(), {
    title: "Headers",
    description: "The headers of the http scheduller",
    example: {
      "Content-Type": "application/json",
    },
  }),
  body: t.String({
    title: "Body",
    description: "The body of the http scheduller",
    example: '{"name": "John", "age": 30}',
  }),
});

const testRequestSchema = t.Object({
  url: t.String({
    title: "URL",
    description: "The URL to dispatch the test request to",
    example: "https://www.google.com",
  }),
  method: t.Union(
    [
      t.Literal("GET"),
      t.Literal("POST"),
      t.Literal("PUT"),
      t.Literal("DELETE"),
      t.Literal("PATCH"),
    ],
    {
      title: "Method",
      description: "The HTTP method of the test request",
      example: "GET",
    },
  ),
  headers: t.Record(t.String(), t.String(), {
    title: "Headers",
    description: "The headers of the test request",
    example: {
      "Content-Type": "application/json",
    },
  }),
  body: t.String({
    title: "Body",
    description: "The body of the test request",
    example: "",
  }),
});

const testResponseSchema = t.Object(
  {
    ok: t.Boolean({
      title: "OK",
      description: "Whether the test request completed without throwing",
    }),
    status: t.Number({
      title: "HTTP Status",
      description: "The HTTP status code returned by the target",
    }),
    body: t.String({
      title: "Response Body",
      description: "The response body returned by the target (truncated)",
    }),
    timeMs: t.Number({
      title: "Time (ms)",
      description: "Elapsed time of the test request in milliseconds",
    }),
    error: t.Optional(
      t.String({
        title: "Error",
        description: "Error message if the test request failed to complete",
      }),
    ),
  },
  {
    title: "Test Response",
    description: "Result of dispatching a test http scheduller request",
  },
);

const exemple: HttpScheduller = {
  externalId: "1234567890",
  triggerType: "cron",
  excludeBeforeExecution: true,
  triggerValue: "0 0 * * *",
  url: "https://www.google.com",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  body: '{"name": "John", "age": 30}',
};

const HttpSchedullerController = new Elysia({
  prefix: "/http-scheduller",
  detail: {
    tags: ["Http Scheduller"],
    description: "Http Scheduller endpoints",
    security: [
      {
        headerAuth: [],
      },
    ],
  },
})
  .get(
    "/",
    async () => {
      return await HttpSchedullerService.getAll();
    },
    {
      detail: {
        summary: "Get all http scheduller",
        description: "Get all http scheduller",
      },
      response: {
        200: t.Array(httpSchedullerSchema, {
          title: "Http Scheduller",
          description: "The http scheduller",
          example: [exemple],
        }),
      },
    },
  )
  .post(
    "/",
    async ({ body, status }) => {
      await HttpSchedullerService.createOrUpdateMany(body);
      return status(StatusMap["No Content"], undefined);
    },
    {
      detail: {
        summary: "Create or update many http scheduller",
        description: "Create or update http scheduller",
      },
      body: t.Array(httpSchedullerSchema, {
        title: "Http Scheduller",
        description: "The http scheduller",
        example: [exemple],
      }),
      response: {
        [StatusMap["No Content"]]: t.Undefined(),
      },
    },
  )
  .delete(
    "/",
    async ({ body, status }) => {
      await HttpSchedullerService.deleteMany(body);
      return status(StatusMap["No Content"], undefined);
    },
    {
      detail: {
        summary: "Delete many http scheduller",
        description: "Delete http scheduller",
      },
      body: t.Array(t.String(), {
        title: "Ids of the http scheduller",
        description: "The ids of the http scheduller",
      }),
      response: {
        [StatusMap["No Content"]]: t.Undefined(),
      },
    },
  )
  .post(
    "/test/:id",
    async ({ params, status }) => {
      const scheduller = await HttpSchedullerService.getById(params.id);
      if (!scheduller) {
        return status(StatusMap["Not Found"], {
          ok: false,
          status: 0,
          body: "",
          timeMs: 0,
          error: "Http scheduller not found",
        });
      }
      const result = await HttpSchedullerService.testRequest({
        url: scheduller.url,
        method: scheduller.method,
        headers: scheduller.headers,
        body: scheduller.body,
      });
      return status(StatusMap.OK, result);
    },
    {
      detail: {
        summary: "Test a stored http scheduller",
        description:
          "Immediately dispatches the request defined by the stored http scheduller and returns the result",
      },
      params: t.Object({
        id: t.String({
          title: "External ID",
          description: "The external ID of the http scheduller",
        }),
      }),
      response: {
        [StatusMap.OK]: testResponseSchema,
        [StatusMap["Not Found"]]: testResponseSchema,
      },
    },
  )
  .post(
    "/test",
    async ({ body, status }) => {
      const result = await HttpSchedullerService.testRequest(body);
      return status(StatusMap.OK, result);
    },
    {
      detail: {
        summary: "Test an http request payload",
        description:
          "Immediately dispatches the provided request and returns the result",
      },
      body: testRequestSchema,
      response: {
        [StatusMap.OK]: testResponseSchema,
      },
    },
  );

export default HttpSchedullerController;
