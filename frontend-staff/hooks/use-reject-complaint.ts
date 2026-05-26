import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useRejectComplaint(onSuccess: (id: number) => void) {
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleReject() {
    if (rejectId === null || submitting) return;

    setSubmitting(true);
    try {
      await Promise.all([
        fetch(`${API_BASE_URL}/requests/update/status?id=${rejectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        }),
        fetch(`${API_BASE_URL}/admin/screenings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: rejectId,
            result: "rejected",
            note: rejectReason,
          }),
        }),
      ]);

      onSuccess(rejectId);
      close();
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setRejectId(null);
    setRejectReason("");
  }

  return {
    rejectId,
    rejectReason,
    submitting,
    setRejectReason,
    openReject: setRejectId,
    handleReject,
    closeReject: close,
  };
}
