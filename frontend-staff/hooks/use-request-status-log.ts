import { useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useRequestStatusLog(staffId: number = 0) {
  const logStatus = useCallback(
    (requestId: number, status: string, note?: string) =>
      fetch(`${API_BASE_URL}/admin/request-status-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
          changedByType: "staff",
          changedById: staffId,
          note: note ?? null,
        }),
      }),
    [staffId],
  );

  return { logStatus };
}
