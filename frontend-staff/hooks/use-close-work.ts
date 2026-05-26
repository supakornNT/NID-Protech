import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type PendingCloseItem = {
  id: number;
  requestId: number;
  title: string;
  resolution: string | null;
  resolvedAt: string | null;
  dueAt: string | null;
  assignedStaffName: string;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
};

function fetchItems(endpoint: string): Promise<PendingCloseItem[]> {
  return fetch(`${API_BASE_URL}${endpoint}`)
    .then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    })
    .then((data) => (Array.isArray(data) ? data : []));
}

export function useCloseWork() {
  const [pending, setPending] = useState<PendingCloseItem[]>([]);
  const [history, setHistory] = useState<PendingCloseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function refetch() {
    setLoading(true);
    setError(false);
    Promise.all([
      fetchItems("/admin/tickets/pending-close"),
      fetchItems("/admin/tickets/approval-history"),
    ])
      .then(([p, h]) => {
        setPending(p);
        setHistory(h);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refetch();
  }, []);

  async function approveTicket(ticketId: number) {
    await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "resolved",
        note: "อนุมัติผลการแก้ไข",
      }),
    });
    refetch();
  }

  async function rejectTicket(ticketId: number, note: string) {
    await fetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress", note }),
    });
    refetch();
  }

  return { pending, history, loading, error, approveTicket, rejectTicket };
}
