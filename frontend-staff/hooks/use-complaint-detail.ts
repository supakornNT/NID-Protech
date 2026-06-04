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
  wasReopened?: boolean;
  latestReopenComment?: string | null;
};

type Attachment = {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string;
};

type WorkDetailResponse = {
  requestId: number;
};

export function useComplaintDetail(id: string | string[] | undefined) {
  const [data, setData] = useState<Detail | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedRequestId, setResolvedRequestId] = useState<string | undefined>(
    undefined,
  );

  const rawId = Array.isArray(id) ? id[0] : id;
  const [prevId, setPrevId] = useState<string | undefined>(rawId);

  if (rawId !== prevId) {
    setPrevId(rawId);
    setLoading(true);
    setData(null);
    setAttachments([]);
    setError(false);
  }

  useEffect(() => {
    if (!id) return;
    setError(false);
    const rawId = (Array.isArray(id) ? id[0] : id) as string;

    async function loadByRequestId(requestId: string) {
      const [detail, files] = await Promise.all([
        fetch(`${API_BASE_URL}/requests/detail?id=${requestId}`).then((r) => {
          if (!r.ok) throw new Error("detail fetch failed");
          return r.json();
        }),
        fetch(`${API_BASE_URL}/requests/attachments?id=${requestId}`).then((r) => {
          if (!r.ok) throw new Error("attachments fetch failed");
          return r.json();
        }),
      ]);

      return {
        detail: (detail ?? null) as Detail | null,
        files: Array.isArray(files) ? files : [],
      };
    }

    loadByRequestId(rawId)
      .then(async ({ detail, files }) => {
        if (detail) {
          setResolvedRequestId(rawId);
          setData(detail);
          setAttachments(files);
          return;
        }

        const ticketDetailResponse = await fetch(
          `${API_BASE_URL}/admin/tickets/${rawId}/work-detail`,
        );

        if (!ticketDetailResponse.ok) {
          throw new Error("ticket work detail fetch failed");
        }

        const ticketDetail =
          (await ticketDetailResponse.json()) as WorkDetailResponse | null;

        if (!ticketDetail?.requestId) {
          setResolvedRequestId(rawId);
          setData(null);
          setAttachments([]);
          return;
        }

        const fallbackRequestId = String(ticketDetail.requestId);
        const fallback = await loadByRequestId(fallbackRequestId);

        setResolvedRequestId(fallbackRequestId);
        setData(fallback.detail);
        setAttachments(fallback.files);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, attachments, loading, error, resolvedRequestId };
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
