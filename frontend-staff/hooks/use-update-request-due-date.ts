import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useUpdateRequestDueDate() {
  const [loading, setLoading] = useState(false);

  async function updateDueDate(id: string | string[] | undefined, resolvedAt: string) {
    const requestId = Array.isArray(id) ? id[0] : id;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requests/update/due-at?id=${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueAt: resolvedAt }),
      });
      if (!res.ok) throw new Error("Update due date failed");
    } finally {
      setLoading(false);
    }
  }

  return { updateDueDate, loading };
}
