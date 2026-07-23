import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientSideApi } from "../api/clientSide";

export const CLIENT_IDS_KEY = "clientIds" as const;

export type ClientIdToAdd = Parameters<
  typeof clientSideApi.client_ids.post
>[0][number];

export type ClientIdReceived = NonNullable<
  Awaited<ReturnType<typeof clientSideApi.client_ids.get>>["data"]
>[number];

export function useClientIdsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CLIENT_IDS_KEY],
    queryFn: async () => {
      const response = await clientSideApi["client_ids"].get();
      if (response.error) throw response.error;
      return response.data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (clientId: ClientIdToAdd) => {
      const response = await clientSideApi["client_ids"].post([clientId]);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENT_IDS_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (hostname: string) => {
      const response = await clientSideApi["client_ids"].delete([hostname]);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENT_IDS_KEY] });
    },
  });

  return {
    clientIds: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? "Failed to load client IDs" : null,
    reload: () =>
      queryClient.invalidateQueries({ queryKey: [CLIENT_IDS_KEY] }),
    upsertClientId: upsertMutation.mutateAsync,
    deleteClientId: async (hostname: string) => {
      await deleteMutation.mutateAsync(hostname);
      return true;
    },
  };
}
