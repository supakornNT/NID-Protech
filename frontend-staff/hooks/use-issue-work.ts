import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type WorkItem = {
  id: number;
  requestNo: string;
  title: string;
  systemName: string;
  customerName: string;
  customerSurname: string;
  probleTypeName: string;
  problemName: string;
  wasRejected: number;
};

export type IssueWorkPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UseIssueWorkParams = {
  page: number;
  limit: number;
  search?: string;
};

const DEFAULT_PAGINATION: IssueWorkPagination = {
  total: 0,
  page: 1,
  limit: 4,
  totalPages: 1,
};

export function useIssueWork({
  page,
  limit,
  search = "",
}: UseIssueWorkParams) {
  const [rows, setRows] = useState<WorkItem[]>([]);
  const [pagination, setPagination] =
    useState<IssueWorkPagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const trimmedSearch = search.trim();
    if (trimmedSearch !== "") {
      query.set("search", trimmedSearch);
    }

    setLoading(true);

    fetch(`${API_BASE_URL}/requests/assign?${query.toString()}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error("Failed to fetch issue work");
        }

        return r.json();
      })
      .then((data) => {
        setRows(Array.isArray(data.items) ? data.items : []);
        setPagination(data.pagination ?? DEFAULT_PAGINATION);
      })
      .catch((err) => {
        console.error(err);
        setRows([]);
        setPagination(DEFAULT_PAGINATION);
      })
      .finally(() => setLoading(false));
  }, [page, limit, search]);

  return { rows, pagination, loading };
}