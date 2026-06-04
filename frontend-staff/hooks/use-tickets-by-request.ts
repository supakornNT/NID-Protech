import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Ticket = {
  id: number;
  assignedStaffName: string | null;
  title: string;
  description: string | null;
  status: string;
  dueAt: string | null;
  resolvedAt: string | null;
  rejectReason?: string | null;
};

export function useTicketsByRequest(requestId: string | undefined) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!requestId) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/admin/tickets/request?id=${requestId}`, {
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load tickets");
        return r.json();
      })
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [requestId, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { tickets, loading, refetch };
}
