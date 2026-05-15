"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword } from "@/lib/form-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEFAULT_LIMIT = 10;

export type CustomerApiItem = {
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

export type CustomerListResponse = {
  items: CustomerApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CustomerPagination = CustomerListResponse["pagination"];

export function useUnapprovedCustomers(search = "") {
  const [items, setItems] = useState<CustomerApiItem[]>([]);
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

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(DEFAULT_LIMIT),
      });
      const normalizedSearch = normalizeSearchKeyword(search);

      if (normalizedSearch) {
        params.set("search", normalizedSearch);
      }

      const response = await fetch(
        `${API_BASE_URL}/customers/unapproved?${params.toString()}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(`Failed to load customers (${response.status})`);
      }

      const result = (await response.json()) as CustomerListResponse;
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
      setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

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
        console.error(updateError);
        setError("ไม่สามารถอัปเดตสถานะผู้ใช้งานได้");
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
