import { useState } from "react";

export function useRejectComplaint(onSuccess: (id: number) => void) {
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleReject() {
    if (rejectId === null) return;

    await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/update/status?id=${rejectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/screenings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: rejectId,
          result: "rejected",
          note: rejectReason,
        }),
      }),
    ]);

    onSuccess(rejectId);
    close();
  }

  function close() {
    setRejectId(null);
    setRejectReason("");
  }

  return {
    rejectId,
    rejectReason,
    setRejectReason,
    openReject: setRejectId,
    handleReject,
    closeReject: close,
  };
}
