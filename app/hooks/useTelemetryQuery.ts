import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientSideApi } from "../api/clientSide";

export const TELEMETRY_KEY = "telemetry" as const;

export type TelemetryRecord = NonNullable<
  Awaited<ReturnType<typeof clientSideApi.telemetry.get>>["data"]
>[number];

export type TelemetryStats = NonNullable<
  Awaited<ReturnType<typeof clientSideApi.telemetry.stats.get>>["data"]
>;

export function useTelemetryQuery(schedulerExternalId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [TELEMETRY_KEY, schedulerExternalId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (schedulerExternalId) {
        params.schedulerExternalId = schedulerExternalId;
      }
      const response = await clientSideApi.telemetry.get(params);
      if (response.error) throw response.error;
      return response.data;
    },
  });

  const statsQuery = useQuery({
    queryKey: [TELEMETRY_KEY, "stats", schedulerExternalId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (schedulerExternalId) {
        params.schedulerExternalId = schedulerExternalId;
      }
      const response = await clientSideApi.telemetry.stats.get(params);
      if (response.error) throw response.error;
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await clientSideApi.telemetry.delete(ids);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TELEMETRY_KEY] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await clientSideApi.telemetry.clear.delete();
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TELEMETRY_KEY] });
    },
  });

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? "Failed to load telemetry" : null,
    stats: statsQuery.data ?? null,
    reload: () => queryClient.invalidateQueries({ queryKey: [TELEMETRY_KEY] }),
    deleteRecords: deleteMutation.mutateAsync,
    clearAll: clearAllMutation.mutateAsync,
  };
}
