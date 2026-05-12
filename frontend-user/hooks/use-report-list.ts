"use client";

import * as React from "react";

import { fetchJson } from "@/lib/fetch";
import { TrackingRow } from "@/types/tracking";

export interface ReportListItem
  extends TrackingRow {
  document: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ReportListResponse {
  items: ReportListItem[];
  pagination: PaginationMeta;
}

const DEFAULT_PAGINATION: PaginationMeta =
  {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

function buildReportsPath(
  page: number,
  limit: number,
  search: string,
): string {
  const searchParams =
    new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

  if (search.trim().length > 0) {
    searchParams.set(
      "search",
      search.trim(),
    );
  }

  return `/user/reports?${searchParams.toString()}`;
}

export function useReportList() {
  const [search, setSearch] =
    React.useState("");
  const [appliedSearch, setAppliedSearch] =
    React.useState("");
  const [reports, setReports] =
    React.useState<ReportListItem[]>([]);
  const [page, setPage] =
    React.useState(1);
  const [limit, setLimit] =
    React.useState(10);
  const [pagination, setPagination] =
    React.useState<PaginationMeta>(
      DEFAULT_PAGINATION,
    );
  const [loading, setLoading] =
    React.useState(true);
  const [error, setError] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setLimit(5);
        setPage(1);
      } else {
        setLimit(10);
        setPage(1);
      }
    }

    handleResize();

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize,
      );
  }, []);

  React.useEffect(() => {
    const controller =
      new AbortController();

    async function loadReports() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await fetchJson<ReportListResponse>(
            buildReportsPath(
              page,
              limit,
              appliedSearch,
            ),
            {
              signal:
                controller.signal,
            },
          );

        setReports(data.items);
        setPagination(data.pagination);
      } catch (loadError) {
        if (
          loadError instanceof Error &&
          loadError.name ===
            "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load reports",
        );
        setReports([]);
        setPagination(
          DEFAULT_PAGINATION,
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReports();

    return () =>
      controller.abort();
  }, [appliedSearch, limit, page]);

  function applySearch() {
    setPage(1);
    setAppliedSearch(search);
  }

  return {
    search,
    setSearch,
    reports,
    pagination,
    loading,
    error,
    setPage,
    applySearch,
  };
}
