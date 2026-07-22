import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientSideApi } from "../api/clientSide";

export const SCHEDULERS_KEY = "schedulers" as const;

export type HttpSchedullerToAdd = Parameters<
  typeof clientSideApi.schedulled_requests.post
>[0][number];

export type HttpSchedullerToTest = Parameters<
  typeof clientSideApi.schedulled_requests.execute.post
>[0];

export type HttpSchedullerReceived = NonNullable<
  Awaited<ReturnType<typeof clientSideApi.schedulled_requests.get>>["data"]
>[number];

export type HttpSchedulledExecuteResult = NonNullable<
  Awaited<
    ReturnType<typeof clientSideApi.schedulled_requests.execute.post>
  >["data"]
>;

export type HttpSchedullerMethods = HttpSchedullerReceived["method"];

export function useSchedulersQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [SCHEDULERS_KEY],
    queryFn: async () => {
      const response = await clientSideApi["schedulled_requests"].get();
      if (response.error) throw response.error;
      return response.data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (scheduler: HttpSchedullerToAdd) => {
      const response = await clientSideApi["schedulled_requests"].post([
        scheduler,
      ]);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULERS_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const response = await clientSideApi["schedulled_requests"].delete([
        externalId,
      ]);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCHEDULERS_KEY] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (scheduler: HttpSchedullerToTest) => {
      const response =
        await clientSideApi.schedulled_requests.execute.post(scheduler);
      if (response.error) throw response.error;
      return response.data;
    },
  });

  return {
    schedulers: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? "Failed to load schedulers" : null,
    reload: () => queryClient.invalidateQueries({ queryKey: [SCHEDULERS_KEY] }),
    upsertScheduler: upsertMutation.mutateAsync,
    deleteScheduler: async (externalId: string) => {
      await deleteMutation.mutateAsync(externalId);
      return true;
    },
    testScheduler: testMutation.mutateAsync,
  };
}
