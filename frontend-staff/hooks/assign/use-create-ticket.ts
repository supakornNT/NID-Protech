import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface CreateTicketPayload {
  requestId: number;
  assignedStaffId: number;
  assignedBy: number | null;
  dueAt: string;
  title: string;
  description: string;
  status: string;
}

export function useCreateTicket(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  async function createTicket(payload: CreateTicketPayload) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Create ticket failed");
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  return { createTicket, loading };
}
