import { useState } from "react";

export function useAcceptComplaint(onSuccess: (id: number) => void) {
  const [acceptId, setAcceptId] = useState<number | null>(null);
  const [acceptReason, setAcceptReason] = useState("");

  async function handleAccept() {
    if (acceptId === null) return;

    await Promise.all([
      fetch(`http://localhost:4000/requests/update?id=${acceptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "assigned" }),
      }),
      fetch("http://localhost:4000/admin/screenings", {
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
