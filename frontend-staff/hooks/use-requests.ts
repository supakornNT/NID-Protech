import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestRow = {
  id: number;
  requestNo: string;
  systemName: string;
  problemName: string;
  requestTypeName: string;
  createdAt: string;
  status: string;
};

type UseRequestsParams = {
  type: "complaint" | "issue";
  page?: number;
  limit?: number;
  search?: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function useRequests(params: UseRequestsParams | "complaint" | "issue") {
  const resolvedParams =
    typeof params === "string"
      ? {
          type: params,
          page: 1,
          limit: 10,
          search: "",
        }
      : params;

  const type = resolvedParams.type;
  const page = Number(resolvedParams.page ?? 1);
  const limit = Number(resolvedParams.limit ?? 10);
  const search =
    typeof resolvedParams.search === "string" ? resolvedParams.search : "";

  const [rows, setRows] = useState<RequestRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      type,
      page: String(page),
      limit: String(limit),
    });

    const keyword = search.trim();

    if (keyword) {
      params.set("search", keyword);
    }

    setLoading(true);

    fetch(`${API_BASE_URL}/requests/screening?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRows(data);
          setPagination({
            total: data.length,
            page: 1,
            limit: data.length || limit,
            totalPages: 1,
          });
          return;
        }

        setRows(Array.isArray(data.items) ? data.items : []);
        setPagination({
          total: Number(data.pagination?.total ?? 0),
          page: Number(data.pagination?.page ?? page),
          limit: Number(data.pagination?.limit ?? limit),
          totalPages: Number(data.pagination?.totalPages ?? 1),
        });
      })
      .catch((err) => {
        console.error("[useRequests] fetch failed:", err);
        setRows([]);
        setPagination({
          total: 0,
          page,
          limit,
          totalPages: 1,
        });
      })
      .finally(() => setLoading(false));
  }, [type, page, limit, search]);

  return { rows, setRows, pagination, loading };
}