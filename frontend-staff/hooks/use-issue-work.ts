import { useState, useEffect } from "react";

export type WorkItem = {
  id: number;
  title: string;
  systemName: string;
  customerName: string;
  customerSurname: string;
  probleTypeName: string;
  problemName: string;
};

export function useIssueWork() {
  const [rows, setRows] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/requests/assign")
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { rows, loading };
}
