"use client";

import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

export function useUnapprovedCustomers() {
  const [items, setItems] = useState<CustomerApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/customers/unapproved?page=1&limit=100`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(`Failed to load customers (${response.status})`);
      }

      const result = (await response.json()) as CustomerListResponse;
      setItems(result.items);
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

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
    loading,
    error,
    activeId,
    fetchCustomers,
    updateCustomerStatus,
  };
}
