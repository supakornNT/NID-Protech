import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useAcceptComplaint(onSuccess: (id: number) => void) {
  const [acceptId, setAcceptId] = useState<number | null>(null);
  const [acceptReason, setAcceptReason] = useState("");

  async function handleAccept() {
    if (acceptId === null) return;

    await Promise.all([
      fetch(`${API_BASE_URL}/requests/update?id=${acceptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "assigned" }),
      }),
      fetch(`${API_BASE_URL}/admin/screenings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: acceptId,
          result: "accepted",
          note: acceptReason,
        }),
      }),
    ]);

    onSuccess(acceptId);
    close();
  }

  function close() {
    setAcceptId(null);
    setAcceptReason("");
  }

  return {
    acceptId,
    acceptReason,
    setAcceptReason,
    openAccept: setAcceptId,
    handleAccept,
    closeAccept: close,
  };
}
