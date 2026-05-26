import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Detail = {
  id: number;
  requestNo: string;
  customerName: string;
  organizationName: string | null;
  systemName: string;
  problemName: string;
  title: string;
  detail: string;
  status: string;
  closedAt: string | null;
  dueAt: string | null;
};

type Attachment = {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string;
};

export function useComplaintDetail(id: string | string[] | undefined) {
  const [data, setData] = useState<Detail | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);

    Promise.all([
      fetch(`${API_BASE_URL}/requests/detail?id=${id}`).then((r) => {
        if (!r.ok) throw new Error("detail fetch failed");
        return r.json();
      }),
      fetch(`${API_BASE_URL}/requests/attachments?id=${id}`).then((r) => {
        if (!r.ok) throw new Error("attachments fetch failed");
        return r.json();
      }),
    ])
      .then(([detail, files]) => {
        setData(detail);
        setAttachments(Array.isArray(files) ? files : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, attachments, loading, error };
}

export function useLightbox() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { lightbox, setLightbox };
}
