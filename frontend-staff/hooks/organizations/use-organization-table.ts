"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword, normalizeTextInput } from "@/lib/form-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TABLE_LIMIT = 10;
const STATUS_OPTIONS = ["active", "inactive"] as const;
const TYPE_OPTIONS = ["company", "government", "other"] as const;

export type OrganizationStatus = (typeof STATUS_OPTIONS)[number];
export type OrganizationType = (typeof TYPE_OPTIONS)[number];
export type OrganizationStatusFilter = "all" | OrganizationStatus;
export type OrganizationTypeFilter = "all" | OrganizationType;

export type OrganizationListApiItem = {
  id: number;
  organizationName: string | null;
  email: string;
  phone: string;
  organizationType: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type OrganizationFormInput = {
  name: string;
  type: OrganizationType;
  email: string;
  phone: string;
  status: OrganizationStatus;
};

export type OrganizationListApiResponse = {
  items: OrganizationListApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UseOrganizationTableOptions = {
  page: number;
  search: string;
  statusFilter: OrganizationStatusFilter;
  typeFilter: OrganizationTypeFilter;
};

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function useOrganizationTable({
  page,
  search,
  statusFilter,
  typeFilter,
}: UseOrganizationTableOptions) {
  const [items, setItems] = useState<OrganizationListApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState<
    OrganizationListApiResponse["pagination"]
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

    if (typeFilter !== "all") {
      params.set("type", typeFilter);
    }

    return `${API_BASE_URL}/admin-organizations/table?${params.toString()}`;
  }, [page, search, statusFilter, typeFilter]);

  const applyListResult = useCallback((result: OrganizationListApiResponse) => {
    setItems(result.items);
    setPagination({
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: Math.max(result.pagination.totalPages, 1),
    });
    setError(null);
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(buildListUrl(), { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to load organizations (${response.status})`);
      }

      applyListResult((await response.json()) as OrganizationListApiResponse);
    } catch (fetchError) {
      if (isAbortError(fetchError)) {
        return;
      }
      console.error(fetchError);
      setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธญเธเธเนเธเธฃเนเธ”เน");
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
          throw new Error(`Failed to load organizations (${response.status})`);
        }

        const result = (await response.json()) as OrganizationListApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        applyListResult(result);
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return;
        }
        console.error(fetchError);
        setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธญเธเธเนเธเธฃเนเธ”เน");
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

  const removeOrganization = useCallback(
    async (id: number) => {
      if (activeId !== null) {
        return false;
      }

      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin-organizations/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to remove organization (${response.status})`);
        }

        await fetchOrganizations();
        return true;
      } catch (removeError) {
        console.error(removeError);
        setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธฅเธเธเนเธญเธกเธนเธฅเธญเธเธเนเธเธฃเนเธ”เน");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [activeId, fetchOrganizations],
  );

  const createOrganization = useCallback(
    async (payload: OrganizationFormInput) => {
      try {
        setSaving(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin-organizations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            name: normalizeTextInput(payload.name),
            email: normalizeTextInput(payload.email),
            phone: normalizeTextInput(payload.phone),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create organization (${response.status})`);
        }

        await fetchOrganizations();
        return true;
      } catch (createError) {
        console.error(createError);
        setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธชเธฃเนเธฒเธเธเนเธญเธกเธนเธฅเธญเธเธเนเธเธฃเนเธ”เน");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchOrganizations],
  );

  const updateOrganization = useCallback(
    async (id: number, payload: OrganizationFormInput) => {
      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin-organizations/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            name: normalizeTextInput(payload.name),
            email: normalizeTextInput(payload.email),
            phone: normalizeTextInput(payload.phone),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update organization (${response.status})`);
        }

        await fetchOrganizations();
        return true;
      } catch (updateError) {
        console.error(updateError);
        setError("เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธเนเนเธเธเนเธญเธกเธนเธฅเธญเธเธเนเธเธฃเนเธ”เน");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [fetchOrganizations],
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
    typeOptions: TYPE_OPTIONS,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    removeOrganization,
  };
}
