import { useState } from "react";

export function useAcceptComplaint(onSuccess: (id: number) => void) {
  const [acceptId, setAcceptId] = useState<number | null>(null);
  const [acceptReason, setAcceptReason] = useState("");

  async function handleAccept() {
    if (acceptId === null) return;

    await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/update/status?id=${acceptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "assigned" }),
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/screenings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: acceptId,
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
