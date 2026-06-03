"use client";

import * as React from "react";

import { useUserSession } from "@/contexts/user-session-context";
import { fetchJson } from "@/lib/fetch";

export interface DashboardSummary {
  total: number;
  screening: number;
  inProgress: number;
  completed: number;
}

const DEFAULT_SUMMARY: DashboardSummary = {
  total: 0,
  screening: 0,
  inProgress: 0,
  completed: 0,
};

export function useDashboardSummary() {
  const { user } = useUserSession();
  const customerId = React.useMemo(() => {
    const userId = Number(user?.id);
    return Number.isFinite(userId) && userId > 0 ? userId : null;
  }, [user?.id]);
  const [summary, setSummary] =
    React.useState<DashboardSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] =
    React.useState(true);
  const [error, setError] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      if (!customerId) {
        setSummary(DEFAULT_SUMMARY);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await fetchJson<DashboardSummary>(
            `/user/dashboard-summary?customerId=${customerId}`,
            {
              signal:
                controller.signal,
            },
          );

        setSummary(data);
      } catch (loadError) {
        if (
          loadError instanceof Error &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load dashboard summary",
        );
        setSummary(DEFAULT_SUMMARY);
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();

    return () => controller.abort();
  }, [customerId]);

  return {
    summary,
    loading,
    error,
  };
}
