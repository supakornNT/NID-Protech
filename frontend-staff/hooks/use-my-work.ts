import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type MyWorkItem = {
  id: number;
  ticketNo: string;
  requestId: number;
  title: string;
  status: string;
  dueAt: string | null;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UseMyWorkParams = {
  staffId: number;
  page: number;
  limit: number;
  search?: string;
  type?: string;
  system?: string;
  sort?: "latest" | "earliest";
};

const EMPTY_PAGINATION: Pagination = {
  total: 0,
  page: 1,
  limit: 4,
  totalPages: 1,
};

export function useMyWork({
  staffId,
  page,
  limit,
  search = "",
  type,
  system,
  sort = "latest",
}: UseMyWorkParams) {
  const [items, setItems] = useState<MyWorkItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      staffId: String(staffId),
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) params.set("search", search.trim());
    if (type) params.set("type", type);
    if (system) params.set("system", system);
    if (sort) params.set("sort", sort);

    setLoading(true);
    setError(false);

    fetch(`${API_BASE_URL}/admin/tickets/my-work?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: { items?: MyWorkItem[]; pagination?: Pagination }) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setPagination(data.pagination ?? EMPTY_PAGINATION);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [staffId, page, limit, search, type, system, sort]);

  async function submitWork(requestId: number) {
    const res = await fetch(`${API_BASE_URL}/requests/${requestId}/submit-work`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId }),
    });

    if (!res.ok) throw new Error("Submit work failed");

    setItems((prev) =>
      prev.map((item) =>
        item.requestId === requestId
          ? { ...item, status: "waiting_confirm" }
          : item,
      ),
    );
  }

  return { items, pagination, loading, error, submitWork };
}