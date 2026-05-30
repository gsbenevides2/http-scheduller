import { useCallback, useEffect, useRef, useState } from "react";
import { HttpScheduller } from "../services/HttpScheduller";
import { getClient } from "../api/[[...slugs]]/eden";
import { SchedulerTestResult } from "../types/SchedulerTestResult";

export default function useSchedulers() {
  const [isLoading, setIsLoading] = useState(true);
  const [schedulers, setSchedulers] = useState<HttpScheduller[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadSchedulers = useCallback(async () => {
    // Guard to avoid setState patterns flagged by eslint-plugin-react-hooks
    // and to prevent state updates after unmount.
    await Promise.resolve();

    if (!mountedRef.current) return;

    setIsLoading(true);
    setError(null);

    const client = getClient();
    try {
      const res = await client.api["http-scheduller"].get();
      if (!mountedRef.current) return;
      if (res.data) setSchedulers(res.data);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Failed to load schedulers", err);
      setError("Failed to load schedulers");
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // load once
    loadSchedulers();
  }, [loadSchedulers]);

  const upsertScheduler = useCallback(
    async (scheduler: HttpScheduller) => {
      const client = getClient();
      const res = await client.api["http-scheduller"].post([scheduler]);
      if (res.status !== 204) {
        throw new Error("Falha ao salvar agendamento");
      }
      await loadSchedulers();
    },
    [loadSchedulers],
  );

  const deleteScheduler = useCallback(
    async (externalId: string) => {
      const client = getClient();
      const res = await client.api["http-scheduller"].delete([externalId]);
      if (res.status === 204) {
        await loadSchedulers();
        return true;
      }
      return false;
    },
    [loadSchedulers],
  );

  const testScheduler = useCallback(
    async (scheduler: HttpScheduller): Promise<SchedulerTestResult> => {
      const origin = window.location.origin;
      const externalId = encodeURIComponent(scheduler.externalId);

      const startedAt = Date.now();
      const res = await fetch(`${origin}/api/http-scheduller/test/${externalId}`, {
        method: "POST",
      });
      const timeMs = Date.now() - startedAt;

      const data = (await res.json().catch(() => null)) as
        | SchedulerTestResult
        | null;

      if (!data) {
        return {
          ok: false,
          status: res.status,
          body: undefined,
          timeMs,
          error: "Resposta inválida do servidor",
        };
      }

      return { ...data, timeMs };
    },
    [],
  );

  return {
    isLoading,
    schedulers,
    error,
    reload: loadSchedulers,
    upsertScheduler,
    deleteScheduler,
    testScheduler,
  };
}
