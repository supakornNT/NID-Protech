import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type StepInfo = { label: string; date: string; time: string } | null;

export interface TrackingItem {
  id: number;
  requestNo: string;
  title: string;
  status: string;
  customerName: string;
  systemName: string;
  problemName: string;
  dueAt: string | null;
  allResolved: number;
  wasRejected: number;
  steps: StepInfo[];
}

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UseTrackingParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

const EMPTY_PAGINATION: Pagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export function useTracking({
  page,
  limit,
  search = "",
  status,
}: UseTrackingParams) {
  const [items, setItems] = useState<TrackingItem[]>([]);
  const [pagination, setPagination] =
    useState<Pagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    setLoading(true);
    setError(false);

    fetch(`${API_BASE_URL}/requests/tracking?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(
        (data: {
          items?: TrackingItem[];
          pagination?: Pagination;
        }) => {
          setItems(Array.isArray(data.items) ? data.items : []);
          setPagination(data.pagination ?? EMPTY_PAGINATION);
        },
      )
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, limit, search, status]);

  return {
    items,
    pagination,
    loading,
    error,
  };
}