"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ImageIcon,
  Inbox,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { useStaffSession } from "@/contexts/staff-session-context";
import { useLoadingDelay } from "@/hooks/use-loading-delay";
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
      <div className="flex min-h-0 flex-col rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
        <div className="mb-4 space-y-2">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-7 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
        </div>

        <div className="mb-4 rounded-2xl border border-[#000000] p-4">
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
              className="h-[108px] rounded-2xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-col rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
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
          <div className="rounded-2xl border border-[#000000] p-4">
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
            <div className="mt-3 h-28 rounded-2xl border border-[#000000] bg-gray-100" />
          </div>

          <div>
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="mt-3 h-28 rounded-2xl border border-[#000000] bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CloseWorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const initialTab = searchParams.get("tab") === "history" ? "history" : "pending";

  const { staff } = useStaffSession();
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
  } = useCloseWork();
  const showSkeleton = useLoadingDelay(loading, 200);

  const [tab] = useState<"pending" | "history">(initialTab);
  const [selectedRequest, setSelectedRequest] = useState<RequestCloseItem | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketCloseItem | null>(null);
  const [requestTickets, setRequestTickets] = useState<TicketCloseItem[]>([]);
  const [requestFiles, setRequestFiles] = useState<CloseAttachment[]>([]);
  const [ticketFiles, setTicketFiles] = useState<CloseAttachment[]>([]);
  const [latestRejectComment, setLatestRejectComment] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchRequests(tab);
  }, [tab, fetchRequests]);

  useEffect(() => {
    const found = requests.find((item) => item.id === requestId) ?? null;
    setSelectedRequest(found);
  }, [requests, requestId]);

  useEffect(() => {
    if (!selectedRequest) {
      setRequestTickets([]);
      setRequestFiles([]);
      setTicketFiles([]);
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
      .then(([tickets, files, latestReject]) => {
        if (cancelled) return;
        setRequestTickets(tickets);
        setRequestFiles(files);
        setLatestRejectComment(latestReject);
        const firstOpenableTicket = tickets.find((ticket) => canOpenTicket(ticket)) ?? null;
        setSelectedTicket(firstOpenableTicket);
      })
      .catch((err) => {
        console.error("Failed to load close-work detail", err);
        if (!cancelled) {
          setErrorMessage("โหลดรายละเอียดคำขอไม่สำเร็จ");
          setModal("error");
        }
      })
      .finally(() => {
        if (!cancelled) setRequestLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRequest, tab, fetchLatestReject, fetchRequestEvidence, fetchRequestTickets]);

  async function handleSelectTicket(ticket: TicketCloseItem) {
    if (!canOpenTicket(ticket)) {
      return;
    }

    setSelectedTicket(ticket);
    setTicketFiles([]);
    setRejectReason(ticket.rejectReason ?? "");
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
    setActionLoading(true);
    try {
      await approveTicket(
        selectedTicket.id,
        selectedTicket.resolutionRequestId,
        Number(staff?.id ?? 0),
      );
      const updatedTickets = await refreshRequestDetail();
      await fetchRequests(tab);
      setSelectedTicket(null);
      setTicketFiles([]);
      setRejectReason("");

      if (tab === "pending" && updatedTickets.length === 0) {
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
    if (!rejectReason.trim()) {
      setErrorMessage("กรุณาระบุเหตุผลที่ไม่อนุมัติ");
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
      await fetchRequests(tab);

      const nextTicket = updatedTickets.find((item) => item.id === selectedTicket.id) ?? null;
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

  function openAttachment(file: CloseAttachment) {
    const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const emptyReason = useMemo(() => {
    if (loading || requestLoading) return "กำลังโหลดข้อมูล...";
    if (error) return "โหลดข้อมูลไม่สำเร็จ";
    if (!selectedRequest) return "ไม่พบคำขอนี้ในรายการปัจจุบัน";
    return "";
  }, [loading, requestLoading, error, selectedRequest]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 bg-[#F0F4FA] p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">พิจารณาปิดงาน</h1>
            <p className="text-[14px] text-gray-500">
              {tab === "pending"
                ? "เลือกตั๋วย่อยจากฝั่งซ้ายเพื่อดูรายละเอียดและพิจารณาอนุมัติ"
                : "ดูประวัติการพิจารณาปิดงานแบบอ่านอย่างเดียว"}
            </p>
          </div>

        </div>

        {((loading && !selectedRequest) || requestLoading) && showSkeleton ? (
          <CloseWorkDetailSkeleton />
        ) : !selectedRequest ? (
          <div className="flex min-h-[620px] items-center justify-center rounded-2xl border border-[#000000] bg-white text-[14px] text-gray-500 shadow-sm">
            {emptyReason}
          </div>
        ) : (
          <div className="grid min-h-[720px] gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-[13px] font-semibold text-[#2F66C5]">{selectedRequest.requestNo}</p>
                <h2 className="mt-1 text-[22px] font-bold leading-tight text-gray-900">
                  {selectedRequest.title}
                </h2>
                <p className="mt-2 text-[13px] text-gray-500">
                  {tab === "pending"
                    ? "ฝั่งซ้ายใช้เลือกตั๋วย่อยที่ลูกน้องส่งมารออนุมัติ"
                    : "ฝั่งซ้ายใช้เลือกตั๋วย่อยจากประวัติ"}
                </p>
              </div>

              <div className="mb-4 rounded-2xl border border-[#000000] p-4">
                <p className="text-[14px] font-bold text-gray-900">
                  ไฟล์แนบจากการแจ้งปัญหา ({requestFiles.length})
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {requestFiles.length === 0 ? (
                    <p className="text-[13px] text-gray-500">ไม่มีไฟล์แนบ</p>
                  ) : (
                    requestFiles.map((file) => {
                      const isImage = IMAGE_EXTENSIONS.has(file.fileExt.toLowerCase());
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => openAttachment(file)}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-[#366DBD] hover:bg-[#F8FBFF]"
                        >
                          {isImage ? (
                            <ImageIcon size={18} className="shrink-0 text-[#2F66C5]" />
                          ) : (
                            <FileText size={18} className="shrink-0 text-[#D1435B]" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-gray-800">
                              {file.originalName}
                            </p>
                            <p className="text-[11px] font-semibold uppercase text-gray-400">
                              {file.fileExt}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <p className="text-[14px] font-bold text-gray-900">รายการตั๋วย่อย</p>
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
                        className="h-[108px] animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
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
                    {requestTickets.map((ticket) => {
                      const active = selectedTicket?.id === ticket.id;
                      const openable = canOpenTicket(ticket);
                      return (
                        <button
                          key={ticket.id}
                          type="button"
                          onClick={() => handleSelectTicket(ticket)}
                          disabled={!openable}
                          className={`flex w-full flex-col gap-2 rounded-2xl border p-3 text-left transition ${
                            active
                              ? "border-[#366DBD] bg-[#EEF4FF]"
                              : openable
                                ? "border-gray-200 bg-white hover:bg-gray-50"
                                : "border-gray-200 bg-gray-50 opacity-70"
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
                            <p className="truncate">ผู้รับผิดชอบ: {ticket.assignedStaffName || "-"}</p>
                            <p>กำหนดส่ง: {formatThaiDate(ticket.dueAt)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
              {ticketLoading ? (
                <div className="flex flex-1 items-center justify-center text-[14px] text-gray-500">
                  กำลังโหลดรายละเอียดตั๋วย่อย...
                </div>
              ) : !selectedTicket ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <ShieldCheck size={36} className="mb-3 text-[#A8B1C2]" />
                  <p className="text-[18px] font-bold text-gray-800">เลือกตั๋วย่อยเพื่อพิจารณา</p>
                  <p className="mt-1 max-w-[360px] text-[14px] text-gray-500">
                    ฝั่งขวาจะแสดงรายละเอียดการแก้ไขของตั๋วที่คุณกดเลือกจากฝั่งซ้าย
                  </p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-5">
                  <div className="border-b border-gray-100 pb-4">
                    <p className="text-[12px] font-semibold text-[#2F66C5]">{selectedTicket.ticketNo}</p>
                    <h3 className="mt-1 text-[22px] font-bold text-gray-900">
                      {selectedTicket.title}
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-[13px] text-gray-600">
                      <p>ผู้รับผิดชอบ: {selectedTicket.assignedStaffName || "-"}</p>
                      <p>กำหนดส่ง: {formatThaiDate(selectedTicket.dueAt)}</p>
                      <p className="col-span-2">
                        สถานะคำขอปิดงาน: {getResolutionLabel(selectedTicket.resolutionStatus)}
                      </p>
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto pr-1">
                    <div className="rounded-2xl border border-[#000000] p-4">
                      <p className="text-[14px] font-bold text-gray-900">ข้อมูลคำขอหลัก</p>
                      <div className="mt-3 space-y-2 text-[14px] text-gray-700">
                        <p>ผู้แจ้ง: {selectedRequest.customerName || "-"}</p>
                        <p>ระบบ: {selectedRequest.systemName || "-"}</p>
                        <p>ประเภท: {selectedRequest.problemName}</p>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-[14px] leading-7 text-gray-700">
                        {selectedRequest.detail || "-"}
                      </p>
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="text-[14px] font-bold text-gray-900">การตีกลับล่าสุด</p>
                        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-7 text-gray-700">
                          {latestRejectComment || "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[14px] font-bold text-gray-900">รายละเอียดงานย่อย</p>
                      <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-[#000000] p-4 text-[14px] leading-7 text-gray-700">
                        {selectedTicket.description || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[14px] font-bold text-gray-900">สรุปผลการแก้ไข</p>
                      <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-[#000000] bg-[#F8FBFF] p-4 text-[14px] leading-7 text-gray-700">
                        {selectedTicket.summary || "-"}
                      </p>
                    </div>

                    {selectedTicket.rejectReason ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-[14px] font-bold text-amber-800">เหตุผลที่เคยส่งกลับแก้ไข</p>
                        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-7 text-amber-900">
                          {selectedTicket.rejectReason}
                        </p>
                      </div>
                    ) : null}

                    <div>
                      <p className="text-[14px] font-bold text-gray-900">
                        ไฟล์หลักฐานการแก้ไข ({ticketFiles.length})
                      </p>
                      <div className="mt-3 flex flex-col gap-2">
                        {ticketFiles.length === 0 ? (
                          <p className="text-[13px] text-gray-500">ไม่มีไฟล์หลักฐานการแก้ไข</p>
                        ) : (
                          ticketFiles.map((file) => {
                            const isImage = IMAGE_EXTENSIONS.has(file.fileExt.toLowerCase());
                            return (
                              <button
                                key={file.id}
                                type="button"
                                onClick={() => openAttachment(file)}
                                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-[#366DBD] hover:bg-[#F8FBFF]"
                              >
                                {isImage ? (
                                  <ImageIcon size={18} className="shrink-0 text-[#2F66C5]" />
                                ) : (
                                  <FileText size={18} className="shrink-0 text-[#D1435B]" />
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-[13px] font-medium text-gray-800">
                                    {file.originalName}
                                  </p>
                                  <p className="text-[11px] font-semibold uppercase text-gray-400">
                                    {file.fileExt}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {tab === "pending" && selectedTicket.resolutionStatus === "pending" ? (
                      <div className="flex flex-wrap justify-end gap-3">
                          <ProTechButton
                            variant="delete"
                            className="h-10 min-w-[140px]"
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
                            className="h-10 min-w-[140px]"
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
          if (!open) setModal(null);
        }}
        title="ยืนยันการอนุมัติ"
        widthClassName="max-w-[420px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF4FF] text-[#2F66C5]">
              <ShieldCheck size={28} />
            </div>
          </div>
          <p className="text-[15px] leading-7 text-gray-600">
            คุณต้องการอนุมัติผลการแก้ไขของตั๋วย่อยนี้ใช่หรือไม่
          </p>
          <div className="flex justify-center gap-3">
            <ProTechButton variant="delete" className="h-10 min-w-[120px]" onClick={() => setModal(null)}>
              ยกเลิก
            </ProTechButton>
            <ProTechButton variant="primary" className="h-10 min-w-[120px]" onClick={handleApprove} disabled={actionLoading}>
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
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF5F7] text-[#D1435B]">
              <TriangleAlert size={28} />
            </div>
          </div>
          <p className="text-center text-[15px] leading-7 text-gray-600">
            คุณต้องการส่งตั๋วย่อยนี้กลับไปแก้ไขใหม่ใช่หรือไม่
          </p>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="reject-reason"
              className="text-[13px] font-semibold text-gray-700"
            >
              เหตุผลที่ไม่อนุมัติ
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
          {!rejectReason.trim() ? (
            <p className="rounded-xl border border-[#FFD7DE] bg-[#FFF5F7] px-4 py-3 text-[13px] text-[#D1435B]">
              กรุณาระบุเหตุผลที่ไม่อนุมัติก่อนยืนยัน
            </p>
          ) : null}
          <div className="flex justify-center gap-3">
            <ProTechButton
              variant="delete"
              className="h-10 min-w-[120px]"
              onClick={() => {
                setModal(null);
                setRejectReason("");
              }}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 min-w-[120px]"
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
          <p className="text-[15px] leading-7 text-gray-600">บันทึกผลการอนุมัติเรียบร้อยแล้ว</p>
          <div className="flex justify-center">
            <ProTechButton variant="primary" className="h-10 min-w-[120px]" onClick={() => setModal(null)}>
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
          <p className="text-[15px] leading-7 text-gray-600">ส่งตั๋วย่อยกลับไปแก้ไขเรียบร้อยแล้ว</p>
          <div className="flex justify-center">
            <ProTechButton variant="primary" className="h-10 min-w-[120px]" onClick={() => setModal(null)}>
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
            <ProTechButton variant="primary" className="h-10 min-w-[120px]" onClick={() => setModal(null)}>
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </>
  );
}
