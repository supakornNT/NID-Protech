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

export function useTracking() {
  const [items, setItems] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(`${API_BASE_URL}/requests/tracking`)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: TrackingItem[]) => setItems(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
