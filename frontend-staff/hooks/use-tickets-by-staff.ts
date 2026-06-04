import { useState, useEffect, useCallback } from "react";

export type StaffTicket = {
  id: number;
  title: string;
  detail: string;
  dueAt: string | null;
  problemName: string;
  requestType: string;
};

export function useTicketsByStaff(staffId: number | null) {
  const [tickets, setTickets] = useState<StaffTicket[]>([]);

  const fetch_ = useCallback(() => {
    if (!staffId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/admin/tickets/by-staff?staffId=${staffId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []));
  }, [staffId]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { tickets: staffId ? tickets : [], refetch: fetch_ };
}
