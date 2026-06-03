"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type LoginLogSummary = {
  day: {
    success: number;
    failed: number;
    staff: number;
    customer: number;
  };
  month: {
    success: number;
    failed: number;
    staff: number;
    customer: number;
  };
  year: {
    success: number;
    failed: number;
    staff: number;
    customer: number;
  };
};

type LoginLogSummaryScope = {
  date: string;
  month: string;
  year: number;
};

export function useLoginLogSummary(scope: LoginLogSummaryScope) {
  const [data, setData] = useState<LoginLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSummary() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (scope.date) {
          params.set("date", scope.date);
        }

        if (scope.month) {
          params.set("month", scope.month);
        }

        if (Number.isInteger(scope.year)) {
          params.set("year", String(scope.year));
        }

        const response = await fetch(
          `${API_BASE_URL}/admin/login-logs/summary?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load login log summary (${response.status})`);
        }

        const result = (await response.json()) as LoginLogSummary;

        if (controller.signal.aborted) {
          return;
        }

        if (!scope.date) {
          result.day = { success: 0, failed: 0, staff: 0, customer: 0 };
        }
        if (!scope.month) {
          result.month = { success: 0, failed: 0, staff: 0, customer: 0 };
        }

        setData(result);
        setError(null);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setError("ไม่สามารถโหลดข้อมูลสรุปได้");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchSummary();

    return () => {
      controller.abort();
    };
  }, [scope.date, scope.month, scope.year]);

  return {
    data,
    loading,
    error,
  };
}
