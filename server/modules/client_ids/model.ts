import { clientIds } from "@/server/db/schema";
import { createSelectSchema, createInsertSchema } from "drizzle-orm/zod";
import { UnwrapSchema } from "elysia";
import { z } from "zod";

export const ClientIdsModel = {
  getClientIdsResponse: z.array(
    createSelectSchema(clientIds, {
      hostname: () =>
        z.string().min(1).meta({
          title: "Hostname",
          description: "The hostname to map to a client ID",
          example: "api.example.com",
        }),
      clientId: (schema) =>
        schema.meta({
          title: "Client ID",
          description: "The Authentik client ID for this hostname",
          example: "abc123def456",
        }),
      createdAt: (schema) =>
        schema.meta({
          title: "Created At",
          description: "When this mapping was created",
        }),
    }),
  ),
  createOrUpdateClientIdBody: z.array(
    createInsertSchema(clientIds, {
      hostname: () =>
        z.string().min(1).meta({
          title: "Hostname",
          description: "The hostname to map to a client ID",
          example: "api.example.com",
        }),
      clientId: (schema) =>
        schema.meta({
          title: "Client ID",
          description: "The Authentik client ID for this hostname",
          example: "abc123def456",
        }),
    }),
  ),
  deleteClientIdsBody: z.array(z.string().min(1)).meta({
    title: "List of Hostnames",
    description: "List of hostnames to delete from the client ID mappings",
    example: ["api.example.com", "auth.example.com"],
  }),
};

export type ClientIdsModel = {
  [k in keyof typeof ClientIdsModel]: UnwrapSchema<
    (typeof ClientIdsModel)[k]
  >;
};

export type ClientIdRecord = typeof clientIds.$inferSelect;

export type CreateOrUpdateClientIdBody = z.infer<
  typeof ClientIdsModel.createOrUpdateClientIdBody
>;
export type DeleteClientIdsBody = z.infer<
  typeof ClientIdsModel.deleteClientIdsBody
>;
