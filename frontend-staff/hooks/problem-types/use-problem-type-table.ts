"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword, normalizeTextInput } from "@/lib/form-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TABLE_LIMIT = 10;

export type ProblemTypeRequestType = "issue" | "complaint";
export type ProblemTypeStatus = "active" | "inactive";
export type ProblemTypeFilter = "all" | ProblemTypeRequestType;

export type ProblemTypeListApiItem = {
  id: number;
  code: string | null;
  name: string;
  requestType: ProblemTypeRequestType;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProblemTypeFormInput = {
  code?: string | null;
  name: string;
  requestType: ProblemTypeRequestType;
  status: ProblemTypeStatus;
};

type ProblemTypeListApiResponse = {
  items: ProblemTypeListApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UseProblemTypeTableOptions = {
  page: number;
  search: string;
  requestType: ProblemTypeFilter;
};

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function useProblemTypeTable({
  page,
  search,
  requestType,
}: UseProblemTypeTableOptions) {
  const [items, setItems] = useState<ProblemTypeListApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState<ProblemTypeListApiResponse["pagination"]>({
    page: 1,
    limit: TABLE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const buildListUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(TABLE_LIMIT),
    });
    const normalizedSearch = normalizeSearchKeyword(search);

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    if (requestType !== "all") {
      params.set("requestType", requestType);
    }

    const query = params.toString();
    return `${API_BASE_URL}/admin/problem-types${query ? `?${query}` : ""}`;
  }, [page, requestType, search]);

  const applyListResult = useCallback((result: ProblemTypeListApiResponse) => {
    setItems(result.items);
    setPagination({
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: Math.max(result.pagination.totalPages, 1),
    });
    setError(null);
  }, []);

  const fetchProblemTypes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(buildListUrl(), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load problem types (${response.status})`);
      }

      applyListResult((await response.json()) as ProblemTypeListApiResponse);
    } catch (fetchError) {
      if (isAbortError(fetchError)) {
        return;
      }
      console.error(fetchError);
      setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธฃเธฐเน€เธ เธ—เธเธฃเธฐเน€เธ”เนเธเนเธฅเธฐเธเธณเธฃเนเธญเธเนเธ”เน");
    } finally {
      setLoading(false);
    }
  }, [applyListResult, buildListUrl]);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        setLoading(true);

        const response = await fetch(buildListUrl(), {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load problem types (${response.status})`);
        }

        const result = (await response.json()) as ProblemTypeListApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        applyListResult(result);
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return;
        }
        console.error(fetchError);
        setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธเธฃเธฐเน€เธ เธ—เธเธฃเธฐเน€เธ”เนเธเนเธฅเธฐเธเธณเธฃเนเธญเธเนเธ”เน");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [applyListResult, buildListUrl]);

  const createProblemType = useCallback(
    async (payload: ProblemTypeFormInput) => {
      try {
        setSaving(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/problem-types`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: normalizeTextInput(payload.name),
            requestType: payload.requestType,
            status: payload.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create problem type (${response.status})`);
        }

        await fetchProblemTypes();
        return true;
      } catch (createError) {
        console.error(createError);
        setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธชเธฃเนเธฒเธเธเธฃเธฐเน€เธ เธ—เธเธฃเธฐเน€เธ”เนเธเธซเธฃเธทเธญเธเธณเธฃเนเธญเธเนเธ”เน");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchProblemTypes],
  );

  const updateProblemType = useCallback(
    async (id: number, payload: ProblemTypeFormInput) => {
      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/problem-types/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: normalizeTextInput(payload.name),
            requestType: payload.requestType,
            status: payload.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update problem type (${response.status})`);
        }

        await fetchProblemTypes();
        return true;
      } catch (updateError) {
        console.error(updateError);
        setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธเนเนเธเธเธฃเธฐเน€เธ เธ—เธเธฃเธฐเน€เธ”เนเธเธซเธฃเธทเธญเธเธณเธฃเนเธญเธเนเธ”เน");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [fetchProblemTypes],
  );

  const removeProblemType = useCallback(
    async (id: number) => {
      if (activeId !== null) {
        return false;
      }

      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/problem-types/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorResult = (await response.json().catch(() => null)) as
            | { message?: string | string[] }
            | null;
          const message = Array.isArray(errorResult?.message)
            ? errorResult?.message[0]
            : errorResult?.message;

          throw new Error(
            message || `Failed to remove problem type (${response.status})`,
          );
        }

        await fetchProblemTypes();
        return true;
      } catch (removeError) {
        setError(
          removeError instanceof Error
            ? removeError.message
            : "เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธฅเธเธเธฃเธฐเน€เธ เธ—เธเธฃเธฐเน€เธ”เนเธเธซเธฃเธทเธญเธเธณเธฃเนเธญเธเนเธ”เน",
        );
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [activeId, fetchProblemTypes],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    items,
    pagination,
    loading,
    error,
    clearError,
    activeId,
    saving,
    fetchProblemTypes,
    createProblemType,
    updateProblemType,
    removeProblemType,
  };
}
