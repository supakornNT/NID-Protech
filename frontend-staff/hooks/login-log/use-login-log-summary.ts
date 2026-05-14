"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type LoginLogSummary = {
  todaySuccess: number;
  todayFailed: number;
  staff: number;
  customer: number;
};

export function useLoginLogSummary() {
  const [data, setData] = useState<LoginLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchSummary() {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/admin/login-logs/summary`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load login log summary (${response.status})`);
        }

        const result = (await response.json()) as LoginLogSummary;

        if (!active) {
          return;
        }

        setData(result);
        setError(null);
      } catch (fetchError) {
        console.error(fetchError);

        if (!active) {
          return;
        }

        setError("ไม่สามารถโหลดข้อมูลสรุปได้");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchSummary();

    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
}
