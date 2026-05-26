"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword } from "@/lib/form-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEFAULT_LIMIT = 10;

export type CustomerListApiItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  customerType: string;
  organizationName: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CustomerListApiResponse = {
  items: CustomerListApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CustomerPagination = CustomerListApiResponse["pagination"];

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function useUnapprovedCustomers(search = "") {
  const [items, setItems] = useState<CustomerListApiItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<CustomerPagination>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const buildListUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(DEFAULT_LIMIT),
    });
    const normalizedSearch = normalizeSearchKeyword(search);

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    return `${API_BASE_URL}/customers/unapproved?${params.toString()}`;
  }, [page, search]);

  const applyListResult = useCallback(
    (result: CustomerListApiResponse) => {
      const nextTotalPages = Math.max(result.pagination.totalPages, 1);

      setItems(result.items);
      setPagination({
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: nextTotalPages,
      });

      if (result.items.length === 0 && page > nextTotalPages) {
        window.setTimeout(() => {
          setPage(nextTotalPages);
        }, 0);
      }

      setError(null);
    },
    [page],
  );

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(buildListUrl(), { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to load customers (${response.status})`);
      }

      applyListResult((await response.json()) as CustomerListApiResponse);
    } catch (fetchError) {
      if (isAbortError(fetchError)) {
        return;
      }
      setError("ไม่สามารถโหลดข้อมูลลูกค้าที่รออนุมัติได้");
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
          throw new Error(`Failed to load customers (${response.status})`);
        }

        const result = (await response.json()) as CustomerListApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        applyListResult(result);
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return;
        }
        setError("ไม่สามารถโหลดข้อมูลลูกค้าที่รออนุมัติได้");
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

  const updateCustomerStatus = useCallback(
    async (id: number, action: "approve" | "reject") => {
      if (activeId !== null) {
        return false;
      }

      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/customers/${id}/${action}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to ${action} customer (${response.status})`);
        }

        await fetchCustomers();
        return true;
      } catch (updateError) {
        setError("ไม่สามารถอัปเดตสถานะลูกค้าได้");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [activeId, fetchCustomers],
  );

  return {
    items,
    page,
    setPage,
    pagination,
    loading,
    error,
    activeId,
    fetchCustomers,
    updateCustomerStatus,
  };
}
