import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useDeleteTicket(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  async function deleteTicket(id: number, staffId?: number) {
    setLoading(true);
    try {
      const url = staffId
        ? `${API_BASE_URL}/admin/tickets/${id}/cancel?staffId=${staffId}`
        : `${API_BASE_URL}/admin/tickets/${id}/cancel`;
      await fetch(url, {
        method: "PATCH",
        credentials: "include",
      });
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  return { deleteTicket, loading };
}
