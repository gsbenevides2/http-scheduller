import { z } from "zod";

const createOrUpdateClientIdBody = z.array(
  z.object({
    hostname: z.string().min(1),
    clientId: z.string().min(1),
  }),
);

const deleteClientIdsBody = z.array(z.string().min(1));

const getClientIdsResponse = z.array(
  z.object({
    hostname: z.string(),
    clientId: z.string(),
    createdAt: z.date().nullable(),
  }),
);

export const ClientIdsModel = {
  createOrUpdateClientIdBody,
  deleteClientIdsBody,
  getClientIdsResponse,
};

export type CreateOrUpdateClientIdBody = z.infer<
  typeof createOrUpdateClientIdBody
>;
export type DeleteClientIdsBody = z.infer<typeof deleteClientIdsBody>;
export type GetClientIdsResponse = z.infer<typeof getClientIdsResponse>;
