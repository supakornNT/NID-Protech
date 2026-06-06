import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type MyWorkItem = {
  id: number;
  ticketNo: string;
  requestId: number;
  title: string;
  status: string;
  dueAt: string | null;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
};

export function useMyWork(staffId: number) {
  const [items, setItems] = useState<MyWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${API_BASE_URL}/admin/tickets/my-work?staffId=${staffId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: MyWorkItem[]) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [staffId]);

  async function submitWork(requestId: number) {
    const res = await fetch(`${API_BASE_URL}/requests/${requestId}/submit-work`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId }),
    });
    if (!res.ok) throw new Error("Submit work failed");
    setItems((prev) =>
      prev.map((item) =>
        item.requestId === requestId
          ? { ...item, status: "waiting_confirm" }
          : item,
      ),
    );
  }

  return { items, loading, error, submitWork };
}
