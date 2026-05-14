"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TABLE_LIMIT = 100;

export type OrganizationApiItem = {
  id: number;
  organizationName: string | null;
  email: string;
  phone: string;
  organizationType: string;
  status: string;
  updatedAt: string | null;
};

type OrganizationListResponse = {
  items: OrganizationApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UseOrganizationTableOptions = {
  search: string;
  statusFilter: string;
  typeFilter: string;
};

export function useOrganizationTable({
  search,
  statusFilter,
  typeFilter,
}: UseOrganizationTableOptions) {
  const [items, setItems] = useState<OrganizationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: "1",
        limit: String(TABLE_LIMIT),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      const response = await fetch(
        `${API_BASE_URL}/admin-organizations/table?${params.toString()}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(`Failed to load organizations (${response.status})`);
      }

      const result = (await response.json()) as OrganizationListResponse;
      setItems(result.items);
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดข้อมูลองค์กรได้");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    void fetchOrganizations();
  }, [fetchOrganizations]);

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) => item.status)
          .filter((value): value is string => value.trim().length > 0),
      ),
    );
  }, [items]);

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) => item.organizationType)
          .filter((value): value is string => value.trim().length > 0),
      ),
    );
  }, [items]);

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
        setError("ไม่สามารถลบข้อมูลองค์กรได้");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [activeId, fetchOrganizations],
  );

  return {
    items,
    loading,
    error,
    activeId,
    statusOptions,
    typeOptions,
    fetchOrganizations,
    removeOrganization,
  };
}
