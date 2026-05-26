import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type KanbanCard = {
  id: number;
  title: string;
  customerName: string;
  remaining: string;
  requestType: string;
};

export type OperationsReport = {
  stats: {
    todayTotal: number;
    todayClosed: number;
    inProgress: number;
    overdue: number;
    screening: number;
  };
  columns: { title: string; cards: KanbanCard[] }[];
  weeklyData: { day: string; ปัญหา: number; ร้องเรียน: number }[];
};

export function useOperationsReport() {
  const [data, setData] = useState<OperationsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reports/operations`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: OperationsReport) => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
