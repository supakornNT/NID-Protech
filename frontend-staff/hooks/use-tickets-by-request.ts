import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (!requestId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/request?id=${requestId}`)
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [requestId]);

  return { tickets, loading };
}
