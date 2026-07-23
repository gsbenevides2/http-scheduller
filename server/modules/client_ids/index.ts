import Elysia, { StatusMap } from "elysia";
import { ClientIdsModel } from "./model";
import { ClientIdsService } from "./service";
import z from "zod";

export const clientIds = new Elysia({
  prefix: "/client_ids",
  detail: {
    tags: ["Client IDs"],
  },
})
  .get(
    "/",
    () => {
      return ClientIdsService.getAll();
    },
    {
      response: {
        [StatusMap.OK]: ClientIdsModel.getClientIdsResponse,
      },
      detail: {
        summary: "Get All Client IDs",
        description: "Returns all hostname to client_id mappings.",
      },
    },
  )
  .post(
    "/",
    async ({ body }) => {
      await ClientIdsService.createOrUpdate(body);
      return;
    },
    {
      body: ClientIdsModel.createOrUpdateClientIdBody,
      response: {
        [StatusMap["No Content"]]: z.undefined(),
      },
      detail: {
        summary: "Create or Update Client IDs",
        description: "Create or update hostname to client_id mappings.",
      },
    },
  )
  .delete(
    "/",
    async ({ body }) => {
      await ClientIdsService.deleteMany(body);
      return;
    },
    {
      detail: {
        summary: "Delete Client IDs",
        description: "Delete hostname to client_id mappings by hostname.",
      },
      body: ClientIdsModel.deleteClientIdsBody,
      response: {
        [StatusMap["No Content"]]: z.undefined(),
      },
    },
  );
