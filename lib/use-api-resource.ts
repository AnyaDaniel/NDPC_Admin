"use client";
import { useEffect, useState } from "react";

export function useApiResource<T>(loader: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    loader()
      .then(value => { if (alive) setData(value); })
      .catch(err => { if (alive) setError(err instanceof Error ? err.message : "Request failed"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, deps);

  return { data, loading, error, setData, setError, reload: () => loader().then(setData).catch(err => setError(err instanceof Error ? err.message : "Request failed")) };
}
