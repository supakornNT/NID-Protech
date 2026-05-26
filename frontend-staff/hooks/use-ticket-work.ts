import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type TicketWorkDetail = {
  ticketId: number;
  requestId: number;
  ticketStatus: string;
  resolution: string | null;
  dueAt: string | null;
  requestNo: string;
  title: string;
  detail: string;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
  rejectNote: string | null;
};

export type TicketAttachment = {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string;
};

export function useTicketWork(
  ticketId: string | string[] | undefined,
  staffId = 1,
) {
  const [data, setData] = useState<TicketWorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ticketAttachments, setTicketAttachments] = useState<TicketAttachment[]>([]);

  const resolvedId = Array.isArray(ticketId) ? ticketId[0] : ticketId;

  useEffect(() => {
    if (!resolvedId) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/admin/tickets/${resolvedId}/work-detail`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: TicketWorkDetail) => { if (!cancelled) { setData(d); setError(false); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [resolvedId]);

  useEffect(() => {
    if (!resolvedId) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/admin/tickets/${resolvedId}/attachments`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: TicketAttachment[]) => { if (!cancelled) setTicketAttachments(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setTicketAttachments([]); });
    return () => { cancelled = true; };
  }, [resolvedId]);

  async function hideAttachment(attachmentId: number) {
    await fetch(`${API_BASE_URL}/admin/tickets/attachment/${attachmentId}/hide`, {
      method: "PATCH",
    });
    setTicketAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }

  async function submitResolution(resolution: string, files: File[]) {
    await fetch(`${API_BASE_URL}/admin/tickets/${resolvedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: resolution,
        status: "waiting_confirm",
        changedBy: staffId,
        note: "รออนุมัติ",
      }),
    });

    if (files.length > 0 && data?.requestId) {
      const form = new FormData();
      form.append("requestId", String(data.requestId));
      files.forEach((f) => form.append("files", f));
      await fetch(`${API_BASE_URL}/admin/tickets/${resolvedId}/attachments`, {
        method: "POST",
        body: form,
      });
    }
  }

  return { data, loading, error, ticketAttachments, hideAttachment, submitResolution };
}
