import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface UpdateTicketPayload {
  dueAt?: string;
  title?: string;
  description?: string;
  status?: string;
  changedBy?: number;
}

export function useUpdateTicket(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  async function updateTicket(id: number, payload: UpdateTicketPayload) {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  return { updateTicket, loading };
}
