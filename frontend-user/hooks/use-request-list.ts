"use client";

import * as React from "react";

import { fetchJson } from "@/lib/fetch";
import { TrackingRow } from "@/types/tracking";

export interface RequestListItem
  extends TrackingRow {
  document: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RequestListResponse {
  items: RequestListItem[];
  pagination: PaginationMeta;
}

const DEFAULT_PAGINATION: PaginationMeta =
  {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

function buildRequestsPath(
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

  return `/user/requests?${searchParams.toString()}`;
}

export function useRequestList() {
  const [appliedSearch, setAppliedSearch] =
    React.useState("");
  const [searchRequestKey, setSearchRequestKey] =
    React.useState(0);
  const [requests, setRequests] =
    React.useState<RequestListItem[]>([]);
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

    async function loadRequests() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await fetchJson<RequestListResponse>(
            buildRequestsPath(
              page,
              limit,
              appliedSearch,
            ),
            {
              signal:
                controller.signal,
            },
          );

        setRequests(data.items);
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
            : "Failed to load requests",
        );
        setRequests([]);
        setPagination(
          DEFAULT_PAGINATION,
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRequests();

    return () =>
      controller.abort();
  }, [
    appliedSearch,
    limit,
    page,
    searchRequestKey,
  ]);

  function applySearch(
    nextSearch: string,
  ) {
    setPage(1);
    setAppliedSearch(
      nextSearch.trim(),
    );
    setSearchRequestKey(
      (current) => current + 1,
    );
  }

  return {
    requests,
    pagination,
    loading,
    error,
    setPage,
    applySearch,
  };
}
