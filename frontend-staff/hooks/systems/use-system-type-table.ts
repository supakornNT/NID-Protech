"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword, normalizeTextInput } from "@/lib/form-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TABLE_LIMIT = 10;
const STATUS_OPTIONS = ["active", "inactive"] as const;

export type SystemStatus = (typeof STATUS_OPTIONS)[number];
export type SystemStatusFilter = "all" | SystemStatus;

export type SystemListApiItem = {
  id: number;
  name: string;
  organizationId: number | null;
  organizationName: string | null;
  status: SystemStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SystemFormInput = {
  name: string;
  organizationId: number | null;
  status: SystemStatus;
};

export type SystemListApiResponse = {
  items: SystemListApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UseSystemTableOptions = {
  page: number;
  search: string;
  statusFilter: SystemStatusFilter;
};

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function useSystemTable({
  page,
  search,
  statusFilter,
}: UseSystemTableOptions) {
  const [items, setItems] = useState<SystemListApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState<
    SystemListApiResponse["pagination"]
  >({
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

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    return `${API_BASE_URL}/admin/systems/table?${params.toString()}`;
  }, [page, search, statusFilter]);

  const applyListResult = useCallback((result: SystemListApiResponse) => {
    setItems(result.items);
    setPagination({
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: Math.max(result.pagination.totalPages, 1),
    });
    setError(null);
  }, []);

  const fetchSystems = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(buildListUrl(), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load systems (${response.status})`);
      }

      const result = (await response.json()) as SystemListApiResponse;
      applyListResult(result);
    } catch (fetchError) {
      if (isAbortError(fetchError)) {
        return;
      }

      console.error(fetchError);
      setError("ไม่สามารถโหลดข้อมูลระบบได้");
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
          throw new Error(`Failed to load systems (${response.status})`);
        }

        const result = (await response.json()) as SystemListApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        applyListResult(result);
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return;
        }

        console.error(fetchError);
        setError("ไม่สามารถโหลดข้อมูลระบบได้");
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

  const removeSystem = useCallback(
    async (id: number) => {
      if (activeId !== null) {
        return false;
      }

      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/systems/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to remove system (${response.status})`);
        }

        await fetchSystems();
        return true;
      } catch (removeError) {
        console.error(removeError);
        setError("ไม่สามารถลบข้อมูลระบบได้");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [activeId, fetchSystems],
  );

  const createSystem = useCallback(
    async (payload: SystemFormInput) => {
      try {
        setSaving(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/systems`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizationId: payload.organizationId,
            name: normalizeTextInput(payload.name),
            status: payload.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create system (${response.status})`);
        }

        await fetchSystems();
        return true;
      } catch (createError) {
        console.error(createError);
        setError("ไม่สามารถสร้างข้อมูลระบบได้");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchSystems],
  );

  const updateSystem = useCallback(
    async (id: number, payload: SystemFormInput) => {
      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/systems/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizationId: payload.organizationId,
            name: normalizeTextInput(payload.name),
            status: payload.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update system (${response.status})`);
        }

        await fetchSystems();
        return true;
      } catch (updateError) {
        console.error(updateError);
        setError("ไม่สามารถแก้ไขข้อมูลระบบได้");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [fetchSystems],
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
    statusOptions: STATUS_OPTIONS,
    fetchSystems,
    createSystem,
    updateSystem,
    removeSystem,
  };
}
