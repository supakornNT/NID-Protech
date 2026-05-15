import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestRow = {
  id: number;
  requestNo: string;
  systemName: string;
  requestTypeName: string;
  createdAt: string;
  status: string;
};

export function useRequests(type: "complaint" | "issue") {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/requests/screening?type=${type}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => console.error("[useRequests] fetch failed:", err))
      .finally(() => setLoading(false));
  }, [type]);

  return { rows, setRows, loading };
}
