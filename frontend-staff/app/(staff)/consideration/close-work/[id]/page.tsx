"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImageIcon,
  Inbox,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { useStaffSession } from "@/contexts/staff-session-context";
import { useLightbox } from "@/hooks/use-complaint-detail";
import {
  useCloseWork,
  type CloseAttachment,
  type RequestCloseItem,
  type TicketCloseItem,
} from "@/hooks/use-close-work";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

type ModalState =
  | "confirmApprove"
  | "confirmReject"
  | "approveSuccess"
  | "rejectSuccess"
  | "error"
  | null;

function formatThaiDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getResolutionLabel(status: string | null) {
  if (!status) return "ยังไม่ส่งรอยืนยัน";
  switch (status) {
    case "pending":
      return "รออนุมัติ";
    case "approved":
      return "อนุมัติแล้ว";
    case "rejected":
      return "ไม่อนุมัติ";
    default:
      return status;
  }
}

function getResolutionClasses(status: string | null) {
  if (!status) return "border-gray-200 bg-gray-50 text-gray-500";
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "approved":
      return "border-green-200 bg-green-50 text-green-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function canOpenTicket(ticket: TicketCloseItem) {
  return !!ticket.resolutionRequestId;
}

function CloseWorkDetailSkeleton() {
  return (
    <div className="grid min-h-[720px] animate-pulse gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="flex min-h-0 flex-col rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="mb-4 space-y-2">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-7 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
        </div>

        <div className="mb-4 rounded-2xl border border-gray-300 p-4">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="mt-3 flex flex-col gap-2">
            <div className="h-12 rounded-xl bg-gray-200" />
            <div className="h-12 rounded-xl bg-gray-200" />
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-28 rounded bg-gray-200" />
          <div className="h-6 w-16 rounded-full bg-gray-200" />
        </div>

        <div className="flex-1 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-27 rounded-2xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-col rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="mt-2 h-7 w-2/3 rounded bg-gray-200" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="col-span-2 h-4 w-1/2 rounded bg-gray-200" />
          </div>
        </div>

        <div className="mt-5 grid min-h-0 flex-1 gap-5">
          <div className="rounded-2xl border border-gray-300 p-4">
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-2/5 rounded bg-gray-200" />
            </div>
            <div className="mt-4 h-20 rounded bg-gray-100" />
          </div>

          <div>
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="mt-3 h-28 rounded-2xl border border-gray-300 bg-gray-100" />
          </div>

          <div>
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="mt-3 h-28 rounded-2xl border border-gray-300 bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketFilesSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
        >
          <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-48 max-w-full rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CloseWorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "history" ? "history" : "pending";
  const TICKET_LIMIT = 5;
  const [ticketPage, setTicketPage] = useState(1);
  const { staff } = useStaffSession();
  const [tab] = useState<"pending" | "history">(initialTab);
  const requestNo = (Array.isArray(params.id) ? params.id[0] : params.id) ?? "";
  const {
    requests,
    loading,
    error,
    fetchRequests,
    fetchRequestTickets,
    fetchRequestEvidence,
    fetchLatestReject,
    fetchTicketAttachments,
    approveTicket,
    rejectTicket,
  } = useCloseWork({
    status: tab,
    page: 1,
    limit: 1,
    search: `${requestNo.trim()}`,
  });

  const { lightbox, setLightbox } = useLightbox();
  const [selectedRequest, setSelectedRequest] =
    useState<RequestCloseItem | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketCloseItem | null>(
    null,
  );
  const [requestTickets, setRequestTickets] = useState<TicketCloseItem[]>([]);
  const [requestFiles, setRequestFiles] = useState<CloseAttachment[]>([]);
  const [ticketFiles, setTicketFiles] = useState<CloseAttachment[]>([]);
  const [latestRejectComment, setLatestRejectComment] = useState<string | null>(
    null,
  );
  const [requestLoading, setRequestLoading] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalSummary, setApprovalSummary] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedRequest(requests[0] ?? null);
  }, [requests]);
  useEffect(() => {
    if (!selectedRequest) {
      setRequestTickets([]);
      setRequestFiles([]);
      setTicketFiles([]);
      setTicketPage(1);
      setLatestRejectComment(null);
      setSelectedTicket(null);
      return;
    }

    let cancelled = false;
    setRequestLoading(true);
    setSelectedTicket(null);
    setTicketFiles([]);
    setRejectReason("");

    Promise.all([
      fetchRequestTickets(selectedRequest.id, tab),
      fetchRequestEvidence(selectedRequest.id),
      fetchLatestReject(selectedRequest.id),
    ])
      .then(async ([tickets, files, latestReject]) => {
        if (cancelled) return;
        setRequestTickets(tickets);
        setRequestFiles(files);
        setLatestRejectComment(latestReject);
        const firstOpenableTicket =
          tickets.find((ticket) => canOpenTicket(ticket)) ?? null;
        setSelectedTicket(firstOpenableTicket);

        if (!firstOpenableTicket) {
          setTicketFiles([]);
          return;
        }

        setTicketLoading(true);
        const filesByTicket = await fetchTicketAttachments(
          firstOpenableTicket.id,
        );
        if (!cancelled) {
          setTicketFiles(filesByTicket);
          setRejectReason(firstOpenableTicket.rejectReason ?? "");
        }
      })
      .catch((err) => {
        console.error("Failed to load close-work detail", err);
        if (!cancelled) {
          setErrorMessage("โหลดรายละเอียดคำขอไม่สำเร็จ");
          setModal("error");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRequestLoading(false);
          setTicketLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    selectedRequest,
    tab,
    fetchLatestReject,
    fetchRequestEvidence,
    fetchRequestTickets,
    fetchTicketAttachments,
  ]);
  const ticketTotalPages = Math.max(
    1,
    Math.ceil(requestTickets.length / TICKET_LIMIT),
  );

  const safeTicketPage = Math.min(ticketPage, ticketTotalPages);

  const pagedRequestTickets = requestTickets.slice(
    (safeTicketPage - 1) * TICKET_LIMIT,
    safeTicketPage * TICKET_LIMIT,
  );
  async function handleSelectTicket(ticket: TicketCloseItem) {
    if (!canOpenTicket(ticket)) {
      return;
    }
    if (selectedTicket?.id === ticket.id) {
      return;
    }

    setSelectedTicket(ticket);
    setTicketFiles([]);
    setRejectReason(ticket.rejectReason ?? "");
    setApprovalSummary("");
    setTicketLoading(true);

    try {
      const files = await fetchTicketAttachments(ticket.id);
      setTicketFiles(files);
    } catch (err) {
      console.error("Failed to load ticket files", err);
      setErrorMessage("โหลดไฟล์หลักฐานการแก้ไขไม่สำเร็จ");
      setModal("error");
    } finally {
      setTicketLoading(false);
    }
  }

  async function refreshRequestDetail() {
    if (!selectedRequest) return [];
    const [tickets, files, latestReject] = await Promise.all([
      fetchRequestTickets(selectedRequest.id, tab),
      fetchRequestEvidence(selectedRequest.id),
      fetchLatestReject(selectedRequest.id),
    ]);
    setRequestTickets(tickets);
    setRequestFiles(files);
    setLatestRejectComment(latestReject);
    return tickets;
  }

  async function handleApprove() {
    if (!selectedTicket) return;
    if (!selectedTicket.resolutionRequestId) {
      setErrorMessage("ตั๋วย่อยนี้ยังไม่ถูกส่งมารอยืนยัน");
      setModal("error");
      return;
    }
    if (isFinalApproval && !approvalSummary.trim()) {
      setErrorMessage("กรุณาระบุรายละเอียดการแก้ไขโดยรวม");
      setModal("error");
      return;
    }
    setModal(null);
    setActionLoading(true);
    try {
      await approveTicket(
        selectedTicket.id,
        selectedTicket.resolutionRequestId,
        Number(staff?.id ?? 0),
        isFinalApproval ? approvalSummary.trim() : undefined,
      );
      const updatedTickets = await refreshRequestDetail();
      // await fetchRequests();
      setSelectedTicket(null);
      setTicketFiles([]);
      setRejectReason("");
      setApprovalSummary("");

      if (tab === "pending" && updatedTickets.length === 0) {
        setModal(null);
        router.push(`/consideration/close-work?tab=${tab}`);
        return;
      }

      setModal("approveSuccess");
    } catch (err) {
      console.error("Approve close-work failed", err);
      setErrorMessage("อนุมัติผลการแก้ไขไม่สำเร็จ");
      setModal("error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedTicket) return;
    if (!selectedTicket.resolutionRequestId) {
      setErrorMessage("ตั๋วย่อยนี้ยังไม่ถูกส่งมารอยืนยัน");
      setModal("error");
      return;
    }

    setActionLoading(true);
    try {
      await rejectTicket(
        selectedTicket.id,
        selectedTicket.resolutionRequestId,
        Number(staff?.id ?? 0),
        rejectReason.trim(),
      );
      const updatedTickets = await refreshRequestDetail();
      // await fetchRequests();

      const nextTicket =
        updatedTickets.find((item) => item.id === selectedTicket.id) ?? null;
      setSelectedTicket(nextTicket);

      if (nextTicket) {
        const files = await fetchTicketAttachments(nextTicket.id);
        setTicketFiles(files);
        setRejectReason(nextTicket.rejectReason ?? "");
      } else {
        setTicketFiles([]);
        setRejectReason("");
      }

      if (tab === "pending" && updatedTickets.length === 0) {
        router.push(`/consideration/close-work?tab=${tab}`);
        return;
      }

      setModal("rejectSuccess");
    } catch (err) {
      console.error("Reject close-work failed", err);
      setErrorMessage("ส่งกลับแก้ไขไม่สำเร็จ");
      setModal("error");
    } finally {
      setActionLoading(false);
    }
  }

  const emptyReason = useMemo(() => {
    if (loading || requestLoading) return "";
    if (error) return "โหลดข้อมูลไม่สำเร็จ";
    if (!selectedRequest) return "ไม่พบคำขอนี้ในรายการปัจจุบัน";
    return "";
  }, [loading, requestLoading, error, selectedRequest]);
  const isFinalApproval =
    tab === "pending" &&
    !!selectedTicket &&
    requestTickets.filter(
      (ticket) => ticket.status !== "closed" && ticket.status !== "cancelled",
    ).length <= 1;

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 text-white hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >
            <X size={32} />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox}
              alt="preview"
              width={900}
              height={700}
              unoptimized
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-6 bg-[#F0F4FA] p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">
                พิจารณาปิดงาน
              </h1>
              <p className="text-[13px] text-gray-500">
                {tab === "pending"
                  ? "เลือกตั๋วย่อยจากฝั่งซ้ายเพื่อดูรายละเอียดและพิจารณาอนุมัติ"
                  : "ดูประวัติการพิจารณาปิดงานแบบอ่านอย่างเดียว"}
              </p>
            </div>
          </div>
        </div>

        {(loading && !selectedRequest) || requestLoading ? (
          <CloseWorkDetailSkeleton />
        ) : !selectedRequest ? (
          <div className="flex min-h-[620px] items-center justify-center rounded-2xl border border-gray-300 bg-white text-[14px] text-gray-500 shadow-sm">
            {emptyReason}
          </div>
        ) : (
          <div className="grid min-h-[720px] gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-[13px] font-semibold text-[#2F66C5]">
                  {selectedRequest.requestNo}
                </p>
                <h2 className="mt-1 text-[22px] font-bold leading-tight text-gray-900">
                  {selectedRequest.title}
                </h2>
                <p className="mt-2 text-[13px] text-gray-500">
                  {tab === "pending"
                    ? "ฝั่งซ้ายใช้เลือกตั๋วย่อยที่ลูกน้องส่งมารออนุมัติ"
                    : "ฝั่งซ้ายใช้เลือกตั๋วย่อยจากประวัติ"}
                </p>
              </div>

              <div className="mb-4 rounded-2xl border border-gray-300 p-4">
                <p className="text-[14px] font-bold text-gray-900">
                  ไฟล์แนบจากการแจ้งปัญหา ({requestFiles.length})
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {requestFiles.length === 0 ? (
                    <p className="text-[13px] text-gray-500">ไม่มีไฟล์แนบ</p>
                  ) : (
                    requestFiles.map((file) => {
                      const ext = file.fileExt.toLowerCase().replace(/^\./, "");
                      const isImage = IMAGE_EXTENSIONS.has(ext);
                      const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
                      const nameNoExt = file.originalName.replace(
                        /\.[^.]+$/,
                        "",
                      );
                      return isImage ? (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setLightbox(url)}
                          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 cursor-zoom-in hover:bg-gray-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <ImageIcon size={20} className="text-blue-500" />
                          </div>
                          <div className="flex min-w-0 flex-col text-left">
                            <span className="truncate text-[13px] font-medium text-gray-800">
                              {nameNoExt}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {ext.toUpperCase()}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <a
                          key={file.id}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 hover:bg-gray-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                            <FileText size={20} className="text-red-500" />
                          </div>
                          <div className="flex min-w-0 flex-col text-left">
                            <span className="truncate text-[13px] font-medium text-gray-800">
                              {nameNoExt}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {ext.toUpperCase()}
                            </span>
                          </div>
                        </a>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <p className="text-[14px] font-bold text-gray-900">
                  รายการตั๋วย่อย
                </p>
                <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-semibold text-[#2F66C5]">
                  {requestTickets.length} งาน
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {requestLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-27 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
                      />
                    ))}
                  </div>
                ) : requestTickets.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Inbox size={28} className="mb-2 text-[#A8B1C2]" />
                    <p className="text-[14px] font-semibold text-gray-600">
                      {tab === "pending"
                        ? "ไม่มีตั๋วย่อยที่รออนุมัติ"
                        : "ไม่มีประวัติตั๋วย่อยในคำขอนี้"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagedRequestTickets.map((ticket) => {
                      const active = selectedTicket?.id === ticket.id;
                      const openable = canOpenTicket(ticket);
                      const disabled = active || !openable;
                      return (
                        <button
                          key={ticket.id}
                          type="button"
                          onClick={() => handleSelectTicket(ticket)}
                          disabled={disabled}
                          className={`flex w-full flex-col gap-2 rounded-2xl border p-3 text-left transition ${
                            active
                              ? "cursor-default border-[#366DBD] bg-[#EEF4FF]"
                              : openable
                                ? "cursor-pointer border-gray-200 bg-white hover:bg-gray-50"
                                : "cursor-not-allowed border-gray-200 bg-gray-50 opacity-70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-[#2F66C5]">
                                {ticket.ticketNo}
                              </p>
                              <p className="line-clamp-2 text-[14px] font-bold text-gray-900">
                                {ticket.title}
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getResolutionClasses(
                                ticket.resolutionStatus,
                              )}`}
                            >
                              {getResolutionLabel(ticket.resolutionStatus)}
                            </span>
                          </div>

                          <div className="space-y-1 text-[12px] text-gray-500">
                            <p className="truncate">
                              ผู้รับผิดชอบ: {ticket.assignedStaffName || "-"}
                            </p>
                            <p>กำหนดส่ง: {formatThaiDate(ticket.dueAt)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {requestTickets.length > TICKET_LIMIT && (
                <div className="mt-3 flex items-center justify-end gap-1 text-[12px] text-gray-500">
                  <button
                    type="button"
                    onClick={() =>
                      setTicketPage((current) => Math.max(1, current - 1))
                    }
                    disabled={safeTicketPage === 1}
                    className="rounded-md px-2 py-1 hover:text-[#366DBD] disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: ticketTotalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setTicketPage(pageNumber)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md border text-[12px] ${
                        safeTicketPage === pageNumber
                          ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                          : "border-transparent hover:border-[#7FA7E8]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setTicketPage((current) =>
                        Math.min(ticketTotalPages, current + 1),
                      )
                    }
                    disabled={safeTicketPage === ticketTotalPages}
                    className="rounded-md px-2 py-1 hover:text-[#366DBD] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
              {!selectedTicket ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <ShieldCheck size={36} className="mb-3 text-[#A8B1C2]" />
                  <p className="text-[18px] font-bold text-gray-800">
                    เลือกตั๋วย่อยเพื่อพิจารณา
                  </p>
                  <p className="mt-1 max-w-90 text-[14px] text-gray-500">
                    ฝั่งขวาจะแสดงรายละเอียดการแก้ไขของตั๋วที่คุณกดเลือกจากฝั่งซ้าย
                  </p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-5">
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-[12px] font-semibold text-[#2F66C5]">
                      {selectedTicket.ticketNo}
                    </p>
                    <h3 className="mt-1 text-[22px] font-bold text-gray-900">
                      {selectedTicket.title}
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-[13px] text-gray-600">
                      <p>
                        ผู้รับผิดชอบ: {selectedTicket.assignedStaffName || "-"}
                      </p>
                      <p>กำหนดส่ง: {formatThaiDate(selectedTicket.dueAt)}</p>
                      <p className="col-span-2">
                        สถานะคำขอปิดงาน:{" "}
                        {getResolutionLabel(selectedTicket.resolutionStatus)}
                      </p>
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto pr-1">
                    <div className="rounded-2xl border border-gray-300 p-4">
                      <p className="text-[14px] font-bold text-gray-900">
                        ข้อมูลคำขอหลัก
                      </p>
                      <div className="mt-3 space-y-2 text-[14px] text-gray-700">
                        <p>ผู้แจ้ง: {selectedRequest.customerName || "-"}</p>
                        <p>ระบบ: {selectedRequest.systemName || "-"}</p>
                        <p>ประเภท: {selectedRequest.problemName}</p>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-[14px] leading-7 text-gray-700">
                        {selectedRequest.detail || "-"}
                      </p>
                      <div className="mt-4 border-t border-gray-100 pt-4">
                       
                      </div>
                    </div>

                    <div>
                      <p className="text-[14px] font-bold text-gray-900">
                        รายละเอียดงานย่อย
                      </p>
                      <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-gray-300 p-4 text-[14px] leading-7 text-gray-700">
                        {selectedTicket.description || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[14px] font-bold text-gray-900">
                        สรุปผลการแก้ไข
                      </p>
                      <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-gray-300 bg-[#F8FBFF] p-4 text-[14px] leading-7 text-gray-700">
                        {selectedTicket.summary || "-"}
                      </p>
                    </div>

                    {latestRejectComment? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-[14px] font-bold text-amber-800">
                          เหตุผลที่เคยส่งกลับแก้ไข
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-7 text-amber-900">
                          {latestRejectComment || "-"}
                        </p>
                      </div>
                    ) : null}
                  {ticketFiles.length > 0 && (  
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">
                        ไฟล์หลักฐานการแก้ไข ({ticketFiles.length})
                      </p>
                      <div className="mt-3 flex flex-col gap-2">
                        {ticketLoading ? (
                          <TicketFilesSkeleton />
                        ) : ticketFiles.length === 0 ? (
                          <p className="text-[13px] text-gray-500">
                            ไม่มีไฟล์หลักฐานการแก้ไข
                          </p>
                        ) : (
                          ticketFiles.map((file) => {
                            const ext = file.fileExt
                              .toLowerCase()
                              .replace(/^\./, "");
                            const isImage = IMAGE_EXTENSIONS.has(ext);
                            const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
                            const nameNoExt = file.originalName.replace(
                              /\.[^.]+$/,
                              "",
                            );
                            return (
                              <div
                                key={file.id}
                                className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                              >
                                <button
                                  type="button"
                                  onClick={() => isImage && setLightbox(url)}
                                  className={`flex min-w-0 items-center gap-3 ${isImage ? "cursor-zoom-in" : "cursor-default"}`}
                                >
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isImage ? "bg-blue-50" : "bg-red-50"}`}
                                  >
                                    {isImage ? (
                                      <ImageIcon
                                        size={20}
                                        className="text-blue-500"
                                      />
                                    ) : (
                                      <FileText
                                        size={20}
                                        className="text-red-500"
                                      />
                                    )}
                                  </div>
                                  <div className="flex min-w-0 flex-col text-left">
                                    <span className="truncate text-[13px] font-medium text-gray-800">
                                      {nameNoExt}
                                    </span>
                                    <span className="text-[11px] text-gray-400">
                                      {ext.toUpperCase()}
                                    </span>
                                  </div>
                                </button>
                                {!isImage && (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-auto shrink-0 text-[12px] text-[#366DBD] hover:underline"
                                  >
                                    เปิด
                                  </a>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                    {tab === "pending" &&
                    selectedTicket.resolutionStatus === "pending" ? (
                      <div className="flex justify-end gap-3 w-full">
                        <ProTechButton
                          variant="delete"
                          className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-35 text-[14px]"
                          onClick={() => {
                            setRejectReason("");
                            setModal("confirmReject");
                          }}
                          disabled={actionLoading}
                        >
                          ไม่อนุมัติ
                        </ProTechButton>
                        <ProTechButton
                          variant="primary"
                          className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-35 text-[14px]"
                          onClick={() => setModal("confirmApprove")}
                          disabled={actionLoading}
                        >
                          อนุมัติ
                        </ProTechButton>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AdminModalShell
        open={modal === "confirmApprove"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
            setApprovalSummary("");
          }
        }}
        title="ยืนยันการอนุมัติ"
        widthClassName="max-w-[420px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center"></div>

          {isFinalApproval ? (
            <div className="text-left">
              <label
                htmlFor="approval-summary"
                className="mb-1 block text-[13px] font-semibold text-gray-700"
              >
                รายละเอียดการแก้ไขโดยรวม <span className="text-red-500">*</span>
              </label>
              <textarea
                id="approval-summary"
                value={approvalSummary}
                onChange={(event) => setApprovalSummary(event.target.value)}
                rows={4}
                placeholder="สรุปรายละเอียดการแก้ไขทั้งหมดสำหรับให้ลูกค้าตรวจสอบ"
                className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
              />
            </div>
          ) : null}
          <div className="flex w-full justify-center gap-3">
            <ProTechButton
              variant="delete"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30 text-[14px]"
              onClick={() => {
                setModal(null);
                setApprovalSummary("");
              }}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30 text-[14px]"
              onClick={handleApprove}
              disabled={
                actionLoading || (isFinalApproval && !approvalSummary.trim())
              }
            >
              ยืนยัน
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      <AdminModalShell
        open={modal === "confirmReject"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
            setRejectReason("");
          }
        }}
        title="พิจารณาผลการแก้ไข"
        widthClassName="max-w-[520px]"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="reject-reason"
              className="text-[13px] font-semibold text-gray-700"
            >
              เหตุผลที่ไม่อนุมัติ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              placeholder="ระบุเหตุผลหากต้องการส่งกลับให้แก้ไขต่อ"
              className="resize-none rounded-xl border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
            />
          </div>
          <div className="flex w-full justify-center gap-3">
            <ProTechButton
              variant="delete"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30 text-[14px]"
              onClick={() => {
                setModal(null);
                setRejectReason("");
              }}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30 text-[14px]"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              ยืนยัน
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      <AdminModalShell
        open={modal === "approveSuccess"}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title="อนุมัติสำเร็จ"
        widthClassName="max-w-[420px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF8EF] text-[#1F9D55]">
              <CheckCircle2 size={34} />
            </div>
          </div>
          <p className="text-[15px] leading-7 text-gray-600">
            บันทึกผลการอนุมัติเรียบร้อยแล้ว
          </p>
          <div className="flex justify-center">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => setModal(null)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      <AdminModalShell
        open={modal === "rejectSuccess"}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title="ส่งกลับแก้ไขสำเร็จ"
        widthClassName="max-w-[420px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5F7] text-[#D1435B]">
              <CheckCircle2 size={34} />
            </div>
          </div>
          <p className="text-[15px] leading-7 text-gray-600">
            ส่งตั๋วย่อยกลับไปแก้ไขเรียบร้อยแล้ว
          </p>
          <div className="flex justify-center">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => setModal(null)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      <AdminModalShell
        open={modal === "error"}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title="เกิดข้อผิดพลาด"
        widthClassName="max-w-[420px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5F7] text-[#D1435B]">
              <AlertCircle size={34} />
            </div>
          </div>
          <p className="text-[15px] leading-7 text-gray-600">
            {errorMessage || "ไม่สามารถดำเนินการได้ในขณะนี้"}
          </p>
          <div className="flex justify-center">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => setModal(null)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </>
  );
}
