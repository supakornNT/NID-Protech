import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ExecutiveReport = {
  stats: {
    total: number;
    closed: number;
    inProgress: number;
    overdue: number;
    avgCloseTime: string;
  };
  weeklyData: { week: string; ปัญหา: number; ร้องเรียน: number }[];
  monthlyData: { month: string; count: number }[];
  donutData: { name: string; value: number; color: string }[];
  commonProblems: { label: string; count: number }[];
  ticketStats: { label: string; prev: number; curr: number; diff: number }[];
  ratings: { star: number; count: number }[];
};

export function useExecutiveReport() {
  const [data, setData] = useState<ExecutiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reports/executive`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: ExecutiveReport) => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
