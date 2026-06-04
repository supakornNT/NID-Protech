import { useEffect, useState } from "react";

import { requireCurrentStaffId } from "@/lib/staff-session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type StepInfo = { label: string; date: string; time: string } | null;

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
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: TrackingItem[]) => setItems(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function submitWork(requestId: number, staffId?: number) {
    const currentStaffId = staffId ?? requireCurrentStaffId();

    await fetch(`${API_BASE_URL}/requests/${requestId}/submit-work`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId: currentStaffId }),
    });
    setItems((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? { ...item, status: "in_progress" }
          : item,
      ),
    );
  }

  return { items, loading, error, submitWork };
}
