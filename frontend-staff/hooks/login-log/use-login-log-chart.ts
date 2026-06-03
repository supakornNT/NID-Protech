"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type LoginLogChartPeriod = "day" | "month" | "year";

export type LoginLogChartItem = {
  label: string;
  success: number;
  failed: number;
  staff: number;
  customer: number;
};

export type LoginLogChartResponse = {
  period: LoginLogChartPeriod;
  selectedDate: string;
  selectedMonth: string;
  selectedYear: number;
  items: LoginLogChartItem[];
};

type LoginLogChartScope = {
  period: LoginLogChartPeriod;
  date: string;
  month: string;
  year: number;
};

export function useLoginLogChart(scope: LoginLogChartScope) {
  const [data, setData] = useState<LoginLogChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scope.period === "day" && !scope.date) {
      setData({
        period: "day",
        selectedDate: "",
        selectedMonth: "",
        selectedYear: scope.year,
        items: [],
      });
      setLoading(false);
      setError(null);
      return;
    }

    if (scope.period === "month" && !scope.month) {
      setData({
        period: "month",
        selectedDate: "",
        selectedMonth: "",
        selectedYear: scope.year,
        items: [],
      });
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("period", scope.period);

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
          `${API_BASE_URL}/admin/login-logs/chart?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load login log chart (${response.status})`);
        }

        const result = (await response.json()) as LoginLogChartResponse;

        if (controller.signal.aborted) {
          return;
        }

        setData(result);
        setError(null);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setError("ไม่สามารถโหลดข้อมูลกราฟการเข้าสู่ระบบได้");
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
  }, [scope.date, scope.month, scope.period, scope.year]);

  return {
    data,
    loading,
    error,
  };
}
