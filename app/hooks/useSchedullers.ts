import { useCallback, useEffect, useState } from "react";
import { HttpScheduller } from "../services/HttpScheduller";
import { getClient } from "../api/[[...slugs]]/eden";

export default function useSchedulers() {
  const [isLoading, setIsLoading] = useState(true);
  const [schedulers, setSchedulers] = useState<HttpScheduller[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadSchedulers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const client = getClient();
    try {
      const res = await client.api["http-scheduller"].get();
      if (res.data) {
        setSchedulers(res.data);
      }
    } catch (err) {
      console.error("Failed to load schedulers", err);
      setError("Failed to load schedulers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const client = getClient();
    client.api["http-scheduller"]
      .get()
      .then((res) => {
        if (res.data) {
          setSchedulers(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load schedulers", err);
        setError("Failed to load schedulers");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const deleteScheduler = useCallback(
    async (externalId: string) => {
      try {
        const client = getClient();
        const res = await client.api["http-scheduller"].delete([externalId]);
        if (res.status === 204) {
          await loadSchedulers();
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to delete scheduler", err);
        throw err;
      }
    },
    [loadSchedulers],
  );

  return {
    isLoading,
    schedulers,
    error,
    reload: loadSchedulers,
    deleteScheduler,
  };
}
