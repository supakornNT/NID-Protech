"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type LoginLogMetaResponse = {
  availableYears: number[];
};

export function useLoginLogMeta() {
  const [data, setData] = useState<LoginLogMetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/admin/login-logs/meta`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load login log meta (${response.status})`);
        }

        const result = (await response.json()) as LoginLogMetaResponse;

        if (controller.signal.aborted) {
          return;
        }

        setData(result);
        setError(null);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        console.error(fetchError);

        if (!controller.signal.aborted) {
          setError("ไม่สามารถโหลดรายการปีได้");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
}
