"use client";

import { useEffect, useState } from "react";

import { normalizeSearchKeyword } from "@/lib/form-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type LoginLogFilters = {
  keyword: string;
  userType: "all" | "staff" | "customer";
  status: "all" | "success" | "failed";
  startDate: string;
  endDate: string;
};

export type LoginLogItem = {
  id: number;
  userType: string;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  loginAt: string | null;
  status: string;
  failReason: string | null;
};

export type LoginLogListResponse = {
  items: LoginLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UseLoginLogListParams = {
  page: number;
  limit: number;
  filters: LoginLogFilters;
};

function buildQuery(params: UseLoginLogListParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));

  const normalizedKeyword = normalizeSearchKeyword(params.filters.keyword);

  if (normalizedKeyword) {
    searchParams.set("search", normalizedKeyword);
  }

  if (params.filters.userType !== "all") {
    searchParams.set("userType", params.filters.userType);
  }

  if (params.filters.status !== "all") {
    searchParams.set("status", params.filters.status);
  }

  if (params.filters.startDate) {
    searchParams.set("startDate", params.filters.startDate);
  }

  if (params.filters.endDate) {
    searchParams.set("endDate", params.filters.endDate);
  }

  return searchParams.toString();
}

export function useLoginLogList(params: UseLoginLogListParams) {
  const [data, setData] = useState<LoginLogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchList() {
      try {
        setLoading(true);

        const query = buildQuery(params);
        const response = await fetch(`${API_BASE_URL}/admin/login-logs?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load login logs (${response.status})`);
        }

        const result = (await response.json()) as LoginLogListResponse;
        setData(result);
        setError(null);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        console.error(fetchError);
        setError("ไม่สามารถโหลดประวัติการเข้าสู่ระบบได้");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchList();

    return () => {
      controller.abort();
    };
  }, [
    params.filters.endDate,
    params.filters.keyword,
    params.filters.startDate,
    params.filters.status,
    params.filters.userType,
    params.limit,
    params.page,
  ]);

  return {
    data,
    loading,
    error,
  };
}
