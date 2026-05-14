import { useState, useEffect } from "react";

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
    fetch(`http://localhost:4000/requests/screening?type=${type}`)
      .then((res) => res.json())
      .then((data) => setRows(data))
      .finally(() => setLoading(false));
  }, [type]);

  return { rows, setRows, loading };
}
