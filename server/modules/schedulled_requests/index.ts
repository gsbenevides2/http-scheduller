import Elysia, { StatusMap } from "elysia";
import { SchedulledRequestsModel } from "./model";
import { SchedulledRequests } from "./service";
import z from "zod";
import { CronnerService } from "@/server/services/Cronner";

export const schedulledRequests = new Elysia({
  prefix: "/schedulled_requests",
  detail: {
    tags: ["Schedulled Requests"],
  },
})
  .get(
    "/",
    () => {
      return SchedulledRequests.getAll();
    },
    {
      response: {
        [StatusMap.OK]: SchedulledRequestsModel.getSchedulledRequestsResponse,
      },
      detail: {
        summary: "Get All Schedulled Requests",
        description: "Returns all schedulled requests in database.",
      },
    },
  )
  .post(
    "/",
    async ({ body }) => {
      await SchedulledRequests.createOrUpdate(body);
      await CronnerService.upsertManyJobs(
        body.map((b) => ({
          id: b.externalId,
          triggerType: b.triggerType,
          triggerValue: b.triggerValue,
        })),
      );
      return;
    },
    {
      body: SchedulledRequestsModel.createOrUpdateSchedulledRequestsBody,
      response: {
        [StatusMap["No Content"]]: z.undefined(),
      },
    },
  )
  .delete(
    "/",
    async ({ body }) => {
      await SchedulledRequests.deleteMany(body);
      await CronnerService.removeManyJobs(body);
      return;
    },
    {
      detail: {
        summary: "Delete many schedullers requests",
        description: "Delete many schedullers requests using or ids",
      },
      body: SchedulledRequestsModel.deleteSchedulledRequestsBody,
      response: {
        [StatusMap["No Content"]]: z.undefined(),
      },
    },
  )
  .post(
    "/execute",
    async ({ body, status }) => {
      const result = await SchedulledRequests.executeRequest(body, body.externalId);
      return status(StatusMap.OK, result);
    },
    {
      detail: {
        summary: "Test a stored http scheduller",
        description:
          "Immediately dispatches the request defined by the stored http scheduller and returns the result",
      },
      body: SchedulledRequestsModel.executeRequestBody,
      response: {
        [StatusMap.OK]: SchedulledRequestsModel.executeRequestResponse,
      },
    },
  );
