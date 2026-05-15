"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword, normalizeTextInput } from "@/lib/form-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TABLE_LIMIT = 10;

export type ProblemTypeRequestType = "issue" | "complaint";
export type ProblemTypeStatus = "active" | "inactive";
export type ProblemTypeFilter = "all" | ProblemTypeRequestType;

export type ProblemTypeApiItem = {
  id: number;
  code: string | null;
  name: string;
  requestType: ProblemTypeRequestType;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProblemTypePayload = {
  code?: string | null;
  name: string;
  requestType: ProblemTypeRequestType;
  status: ProblemTypeStatus;
};

type ProblemTypeListResponse = {
  items: ProblemTypeApiItem[];
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

export function useProblemTypeTable({
  page,
  search,
  requestType,
}: UseProblemTypeTableOptions) {
  const [items, setItems] = useState<ProblemTypeApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState<ProblemTypeListResponse["pagination"]>({
    page: 1,
    limit: TABLE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const fetchProblemTypes = useCallback(async () => {
    try {
      setLoading(true);

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
      const response = await fetch(
        `${API_BASE_URL}/admin/problem-types${query ? `?${query}` : ""}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load problem types (${response.status})`);
      }

      const result = (await response.json()) as ProblemTypeListResponse;
      setItems(result.items);
      setPagination({
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: Math.max(result.pagination.totalPages, 1),
      });
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดข้อมูลประเภทประเด็นและคำร้องได้");
    } finally {
      setLoading(false);
    }
  }, [page, requestType, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProblemTypes();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchProblemTypes]);

  const createProblemType = useCallback(
    async (payload: ProblemTypePayload) => {
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
        setError("ไม่สามารถสร้างประเภทประเด็นหรือคำร้องได้");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchProblemTypes],
  );

  const updateProblemType = useCallback(
    async (id: number, payload: ProblemTypePayload) => {
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
        setError("ไม่สามารถแก้ไขประเภทประเด็นหรือคำร้องได้");
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
            : "ไม่สามารถลบประเภทประเด็นหรือคำร้องได้",
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
