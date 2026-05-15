import { useState, useEffect } from "react";

export type StaffTicket = {
  id: number;
  title: string;
  detail: string;
  resolvedAt: string | null;
  problemName: string;
  requestType: string;
};

export function useTicketsByStaff(staffId: number | null) {
  const [tickets, setTickets] = useState<StaffTicket[]>([]);

  useEffect(() => {
    if (!staffId) return;
    fetch(`http://localhost:4000/admin/tickets/by-staff?staffId=${staffId}`)
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []));
  }, [staffId]);

  return { tickets: staffId ? tickets : [] };
}
