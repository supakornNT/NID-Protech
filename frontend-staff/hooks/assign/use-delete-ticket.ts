import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useDeleteTicket(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  async function deleteTicket(id: number) {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/admin/tickets/${id}/cancel`, {
        method: "PATCH",
      });
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  return { deleteTicket, loading };
}
