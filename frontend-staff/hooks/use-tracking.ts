import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type StepInfo = { date: string; time: string } | null;

export interface TrackingItem {
  id: number;
  title: string;
  status: string;
  customerName: string;
  systemName: string;
  problemName: string;
  dueAt: string | null;
  allResolved: number;
  wasRejected: number;
  steps: [StepInfo, StepInfo, StepInfo, StepInfo];
}

export function useTracking() {
  const [items, setItems] = useState<TrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(`${API_BASE_URL}/requests/tracking`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: TrackingItem[]) => setItems(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function submitWork(requestId: number, staffId = 1) {
    await fetch(`${API_BASE_URL}/requests/${requestId}/submit-work`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId }),
    });
    setItems((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? { ...item, status: "waiting_confirm" }
          : item,
      ),
    );
  }

  return { items, loading, error, submitWork };
}
