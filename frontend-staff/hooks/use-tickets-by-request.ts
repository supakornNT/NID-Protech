import { useState, useEffect, useCallback } from "react";

export type Ticket = {
  id: number;
  assignedStaffName: string | null;
  title: string;
  status: string;
  resolvedAt: string | null;
};

export function useTicketsByRequest(requestId: string | string[] | undefined) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/request?id=${requestId}`)
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [requestId, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { tickets, loading, refetch };
}
