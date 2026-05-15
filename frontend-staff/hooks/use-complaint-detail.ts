import { useState, useEffect } from "react";

type Detail = {
  id: number;
  requestNo: string;
  customerName: string;
  organizationName: string | null;
  systemName: string;
  problemName: string;
  title: string;
  detail: string;
  closedAt: string | null;
};

type Attachment = {
  id: number;
  original_name: string;
  saved_name?: string;
  file_ext: string;
};

export function useComplaintDetail(id: string | string[] | undefined) {
  const [data, setData] = useState<Detail | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/detail?id=${id}`).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/attachments?id=${id}`).then((r) => r.json()),
    ])
      .then(([detail, files]) => {
        setData(detail);
        setAttachments(Array.isArray(files) ? files : []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, attachments, loading };
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
