import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type RequestCloseItem = {
  id: number;
  requestNo: string;
  title: string;
  detail: string;
  status: string;
  customerName: string;
  systemName: string | null;
  problemName: string;
};

export type TicketCloseItem = {
  id: number;
  ticketNo: string;
  title: string;
  description: string;
  status: string;
  dueAt: string | null;
  assignedStaffName: string;
  resolutionRequestId: number | null;
  summary: string | null;
  resolutionStatus: string | null;
  rejectReason: string | null;
  requestedAt: string | null;
};

export type CloseAttachment = {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string;
};

export type CloseWorkPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UseCloseWorkParams = {
  status?: "pending" | "history";
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  system?: string;
  sort?: string;
};

const DEFAULT_PAGINATION: CloseWorkPagination = {
  total: 0,
  page: 1,
  limit: 4,
  totalPages: 1,
};

export function useCloseWork(params: UseCloseWorkParams = {}) {
  const {
    status = "pending",
    page = 1,
    limit = 4,
    search = "",
    type,
    system,
    sort,
  } = params;

  const [requests, setRequests] = useState<RequestCloseItem[]>([]);
  const [pagination, setPagination] =
    useState<CloseWorkPagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const query = new URLSearchParams({
        status,
        page: String(page),
        limit: String(limit),
      });

      const trimmedSearch = search.trim();
      if (trimmedSearch !== "") {
        query.set("search", trimmedSearch);
      }
      if (type) query.set("type", type);
      if (system) query.set("system", system);
      if (sort) query.set("sort", sort);

      const response = await fetch(
        `${API_BASE_URL}/admin/close-work/requests?${query.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch close-work requests");
      }

      const data = await response.json();

      setRequests(Array.isArray(data.items) ? data.items : []);
      setPagination(data.pagination ?? DEFAULT_PAGINATION);
    } catch (err) {
      setError(true);
      setRequests([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, search, type, system, sort]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const fetchRequestTickets = useCallback(
    async (
      requestId: number,
      status: "pending" | "history" = "pending",
    ): Promise<TicketCloseItem[]> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/close-work/requests/${requestId}/tickets?status=${status}`,
        );
        if (!response.ok) throw new Error("Failed to fetch close-work tickets");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        return [];
      }
    },
    [],
  );

  const fetchRequestEvidence = useCallback(
    async (requestId: number): Promise<CloseAttachment[]> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/close-work/requests/${requestId}/attachments`,
        );
        if (!response.ok) throw new Error("Failed to fetch request attachments");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        return [];
      }
    },
    [],
  );

  const fetchLatestReject = useCallback(
    async (requestId: number): Promise<string | null> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/close-work/requests/${requestId}/latest-reject`,
        );
        if (!response.ok) throw new Error("Failed to fetch latest reject");

        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          return typeof data === "string" && data.trim() !== "" ? data : null;
        }

        const text = (await response.text()).trim();
        return text && text !== "null" ? text : null;
      } catch (err) {
        return null;
      }
    },
    [],
  );

  const fetchTicketAttachments = useCallback(
    async (ticketId: number): Promise<CloseAttachment[]> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/close-work/tickets/${ticketId}/attachments`,
        );
        if (!response.ok) throw new Error("Failed to fetch ticket attachments");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        return [];
      }
    },
    [],
  );

  const approveTicket = useCallback(
    async (
      ticketId: number,
      resolutionRequestId: number,
      reviewedBy: number,
      summary?: string,
    ) => {
      const response = await fetch(
        `${API_BASE_URL}/admin/close-work/tickets/${ticketId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolutionRequestId, reviewedBy, summary }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to approve close-work ticket");
      }

      return response.json();
    },
    [],
  );

  const rejectTicket = useCallback(
    async (
      ticketId: number,
      resolutionRequestId: number,
      reviewedBy: number,
      rejectReason: string,
    ) => {
      const response = await fetch(
        `${API_BASE_URL}/admin/close-work/tickets/${ticketId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolutionRequestId, reviewedBy, rejectReason }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject close-work ticket");
      }

      return response.json();
    },
    [],
  );

  const changeRequestState = useCallback(
    async (
      requestId: number,
      status: string,
      note: string,
      changedById: number,
    ) => {
      const response = await fetch(
        `${API_BASE_URL}/admin/close-work/requests/${requestId}/change-state`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, note, changedById }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to change close-work request state");
      }

      return response.json();
    },
    [],
  );

  return {
    requests,
    pagination,
    loading,
    error,
    fetchRequests,
    fetchRequestTickets,
    fetchRequestEvidence,
    fetchLatestReject,
    fetchTicketAttachments,
    approveTicket,
    rejectTicket,
    changeRequestState,
  };
}