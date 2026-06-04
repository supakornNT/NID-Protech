import { useState } from "react";

export function useUpdateRequestStatus() {
  const [loading, setLoading] = useState(false);

  async function updateStatus(id: string | string[] | undefined, status: string) {
    const requestId = Array.isArray(id) ? id[0] : id;
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/requests/update/status?id=${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } finally {
      setLoading(false);
    }
  }

  return { updateStatus, loading };
}
