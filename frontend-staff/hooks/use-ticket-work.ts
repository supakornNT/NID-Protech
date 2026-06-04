import { useEffect, useState } from "react";

import { useStaffSession } from "@/contexts/staff-session-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type TicketWorkDetail = {
  ticketId: number;
  requestId: number;
  ticketStatus: string;
  ticketTitle: string;
  ticketDescription: string | null;
  dueAt: string | null;
  resolutionRequestId: number | null;
  resolutionRequestStatus: string | null;
  resolutionSummary: string | null;
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
  staffId?: number,
) {
  const { staff } = useStaffSession();
  const [data, setData] = useState<TicketWorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ticketAttachments, setTicketAttachments] = useState<TicketAttachment[]>([]);

  const resolvedId = Array.isArray(ticketId) ? ticketId[0] : ticketId;
  const [prevId, setPrevId] = useState<string | undefined>(resolvedId);

  if (resolvedId !== prevId) {
    setPrevId(resolvedId);
    setLoading(true);
    setData(null);
    setTicketAttachments([]);
    setError(false);
  }

  useEffect(() => {
    if (!resolvedId) return;
    let cancelled = false;

    fetch(`${API_BASE_URL}/admin/tickets/${resolvedId}/work-detail`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((detail: TicketWorkDetail) => {
        if (cancelled) return;
        setData(detail);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedId]);

  useEffect(() => {
    if (!resolvedId) return;
    let cancelled = false;

    fetch(`${API_BASE_URL}/admin/tickets/${resolvedId}/attachments`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((items: TicketAttachment[]) => {
        if (cancelled) return;
        setTicketAttachments(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (cancelled) return;
        setTicketAttachments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedId]);

  async function hideAttachment(attachmentId: number) {
    await fetch(`${API_BASE_URL}/admin/tickets/attachment/${attachmentId}/hide`, {
      method: "PATCH",
    });
    setTicketAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
  }

  async function submitResolution(summary: string, files: File[]) {
    const currentStaffId =
      staffId ?? (typeof staff?.id === "number" ? staff.id : Number(staff?.id));

    if (!currentStaffId) {
      window.dispatchEvent(new CustomEvent("session:expired"));
      throw new Error("Missing staff session");
    }

    if (!data?.requestId) {
      throw new Error("Missing request id");
    }

    const form = new FormData();
    form.append("requestedBy", String(currentStaffId));
    form.append("summary", summary);
    form.append("requestId", String(data.requestId));
    files.forEach((file) => form.append("files", file));

    const response = await fetch(
      `${API_BASE_URL}/admin/tickets/${resolvedId}/submit-resolution`,
      {
        method: "POST",
        body: form,
      },
    );

    if (!response.ok) {
      throw new Error("Submit resolution failed");
    }
  }

  return { data, loading, error, ticketAttachments, hideAttachment, submitResolution };
}
