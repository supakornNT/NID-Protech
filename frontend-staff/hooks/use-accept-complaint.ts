import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useAcceptComplaint(
  onSuccess: (id: number) => void,
  staffId: number,
) {
  const [acceptId, setAcceptId] = useState<number | null>(null);
  const [acceptReason, setAcceptReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAccept() {
    if (acceptId === null || submitting) return;

    setSubmitting(true);
    try {
      await Promise.all([
        fetch(`${API_BASE_URL}/requests/update/status?id=${acceptId}`, {
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
        fetch(`${API_BASE_URL}/admin/request-status-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: acceptId,
            status: "screening",
            changedByType: "staff",
            changedById: staffId,
            note: acceptReason || null,
          }),
        }),
      ]);

      onSuccess(acceptId);
      close();
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setAcceptId(null);
    setAcceptReason("");
  }

  return {
    acceptId,
    acceptReason,
    submitting,
    setAcceptReason,
    openAccept: setAcceptId,
    handleAccept,
    closeAccept: close,
  };
}
