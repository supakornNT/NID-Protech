import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type MyRequestItem = {
  requestId: number;
  ticketId: number;
  title: string;
  requestStatus: string;
  dueAt: string | null;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
  allResolved: number;
};

export function useMyWork(staffId: number) {
  const [items, setItems] = useState<MyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${API_BASE_URL}/admin/tickets/my-requests?staffId=${staffId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: MyRequestItem[]) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [staffId]);

  async function submitWork(requestId: number) {
    await fetch(`${API_BASE_URL}/requests/${requestId}/submit-work`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId }),
    });
    setItems((prev) =>
      prev.map((item) =>
        item.requestId === requestId
          ? { ...item, requestStatus: "waiting_confirm" }
          : item,
      ),
    );
  }

  return { items, loading, error, submitWork };
}
