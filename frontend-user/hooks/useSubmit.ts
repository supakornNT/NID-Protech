"use client";

import { useState } from "react";

export function useSubmit(endpoint: string, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("ส่งไม่สำเร็จ");
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }
  return { submit, loading, error };
}
