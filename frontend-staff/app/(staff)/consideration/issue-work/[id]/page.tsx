"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ImageIcon,
  Users,
  X,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import { useTicketsByRequest } from "@/hooks/use-tickets-by-request";
import { useLoadingDelay } from "@/hooks/use-loading-delay";
import { useUpdateRequestStatus } from "@/hooks/use-update-request-status";
import { useUpdateTicket } from "@/hooks/assign/use-update-ticket";
import { useDeleteTicket } from "@/hooks/assign/use-delete-ticket";
import { useUpdateRequestDueDate } from "@/hooks/use-update-request-due-date";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { useRequestStatusLog } from "@/hooks/use-request-status-log";
import { useStaffSession } from "@/contexts/staff-session-context";
import { formatBangkokTimeLeft } from "@/lib/tracking-time";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const SUBTASK_LIMIT = 4;

interface TicketDetail {
  fullName: string;
  title: string;
  description: string;
  dueAt: string | null;
}

interface EditModal {
  open: boolean;
  ticketId: number | null;
  detail: TicketDetail | null;
  detailLoading: boolean;
}

export default function ManageWorkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMainDue = searchParams.get("mainDue") ?? undefined;
  const { staff } = useStaffSession();
  const staffId = typeof staff?.id === "number" ? staff.id : Number(staff?.id);
  const { data, attachments, loading, resolvedRequestId } =
    useComplaintDetail(id);
  const { lightbox, setLightbox } = useLightbox();
  const showSkeleton = useLoadingDelay(loading, 200);
  const effectiveRequestId =
    resolvedRequestId ?? (Array.isArray(id) ? id[0] : id);
  const { tickets, refetch } = useTicketsByRequest(effectiveRequestId);
  const { updateStatus } = useUpdateRequestStatus();
  const { logStatus } = useRequestStatusLog(staffId);
  const { updateDueDate, loading: dueDateLoading } = useUpdateRequestDueDate();

  const [subPage, setSubPage] = useState(1);
  const [subSearch, setSubSearch] = useState("");
  const [editedDueDate, setDueDate] = useState<string | undefined>(queryMainDue);

  // Default due date to 3 days from today
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-CA");
  }, []);

  const dueDate =
    editedDueDate ??
    (data?.dueAt
      ? new Date(data.dueAt).toLocaleDateString("en-CA")
      : defaultDueDate);
  const localToday = new Date().toLocaleDateString("en-CA");

  const filteredSub = tickets.filter(
    (t) =>
      (t.status === "assigned" ||
        t.status === "resolved" ||
        t.status === "closed") &&
      (subSearch === "" ||
        t.title.includes(subSearch) ||
        (t.assignedStaffName ?? "").includes(subSearch)),
  );
  const totalSubPages = Math.max(
    1,
    Math.ceil(filteredSub.length / SUBTASK_LIMIT),
  );
  const pagedSub = filteredSub.slice(
    (subPage - 1) * SUBTASK_LIMIT,
    subPage * SUBTASK_LIMIT,
  );
  const uniqueAssignees = new Set(
    tickets.map((t) => t.assignedStaffName).filter(Boolean),
  ).size;

  const [editModal, setEditModal] = useState<EditModal>({
    open: false,
    ticketId: null,
    detail: null,
    detailLoading: false,
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    dueAt: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [showDueDateConfirm, setShowDueDateConfirm] = useState(false);
  const [showDueDateSuccess, setShowDueDateSuccess] = useState(false);
  const [showForwardConfirm, setShowForwardConfirm] = useState(false);
  const [showForwardSuccess, setShowForwardSuccess] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenFiles, setReopenFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!effectiveRequestId) return;
    let cancelled = false;

    fetch(
      `${API_BASE_URL}/admin/close-work/requests/${effectiveRequestId}/reopen-attachments`,
    )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((files) => {
        if (!cancelled) setReopenFiles(Array.isArray(files) ? files : []);
      })
      .catch(() => {
        if (!cancelled) setReopenFiles([]);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveRequestId]);

  const { updateTicket, loading: updateLoading } = useUpdateTicket(() => {
    setEditModal({
      open: false,
      ticketId: null,
      detail: null,
      detailLoading: false,
    });
    setEditError(null);
    setShowEditSuccess(true);
    refetch();
  });

  const { deleteTicket } = useDeleteTicket(() => {
    setShowCancelSuccess(true);
    refetch();
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function openEditModal(ticketId: number) {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setEditError(null);
    setEditModal({ open: true, ticketId, detail: null, detailLoading: true });
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/tickets/id?id=${ticketId}`,
        {
          signal: controller.signal,
        },
      );
      if (!res.ok) throw new Error();
      const detail: TicketDetail = await res.json();
      setEditForm({
        title: detail.title ?? "",
        description: detail.description ?? "",
        dueAt: detail.dueAt ? detail.dueAt.slice(0, 10) : "",
      });
      setEditModal({ open: true, ticketId, detail, detailLoading: false });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setEditModal({
        open: false,
        ticketId: null,
        detail: null,
        detailLoading: false,
      });
    }
  }

  async function handleSaveEdit() {
    if (!editModal.ticketId || !editForm.title.trim()) return;
    await updateTicket(editModal.ticketId, {
      title: editForm.title,
      description: editForm.description,
      dueAt: editForm.dueAt || undefined,
      changedBy: staffId,
    });
  }

  async function handleSave() {
    const requestId = Number(
      resolvedRequestId ?? (Array.isArray(id) ? id[0] : id),
    );
    if (editedDueDate) await updateDueDate(String(requestId), editedDueDate);
    await Promise.all([
      updateStatus(String(requestId), "in_progress"),
      logStatus(requestId, "in_progress"),
    ]);
    setShowForwardSuccess(true);
  }

  const hasActiveTicket = tickets.some(
    (t) =>
      t.status !== "resolved" &&
      t.status !== "closed" &&
      t.status !== "cancelled",
  );
  const canSubmit = !!dueDate && hasActiveTicket;

  if (!loading && !data)
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
        ไม่พบข้อมูล
      </div>
    );

  return (
    <>
      {/* Lightbox */}
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

      {/* Edit Modal */}
      <AdminModalShell
        open={editModal.open}
        onOpenChange={(open) => {
          if (!open) {
            abortControllerRef.current?.abort();
            setEditModal({
              open: false,
              ticketId: null,
              detail: null,
              detailLoading: false,
            });
            setEditError(null);
          }
        }}
        title="แก้ไขงานย่อย"
      >
        {editModal.detailLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            กำลังโหลด...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {editError && (
              <p className="rounded-lg border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-xs text-[#D1435B]">
                {editError}
              </p>
            )}

            {editModal.detail?.fullName && (
              <div>
                <p className="mb-1 text-[13px] text-gray-500">ผู้รับผิดชอบ</p>
                <p className="text-[14px] font-semibold text-gray-800">
                  {editModal.detail.fullName}
                </p>
              </div>
            )}
            <div>
              <label className="mb-1 block text-[13px] text-gray-500">
                ชื่องาน
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-gray-500">
                รายละเอียด
              </label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-gray-500">
                กำหนดวันส่ง
              </label>
              <input
                type="date"
                value={editForm.dueAt}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, dueAt: e.target.value }))
                }
                min={localToday}
                max={dueDate}
                className="rounded-lg border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditModal({
                    open: false,
                    ticketId: null,
                    detail: null,
                    detailLoading: false,
                  });
                  setEditError(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editForm.title.trim()) return;
                  if (!editForm.dueAt) {
                    setEditError("กรุณาเลือกกำหนดส่งงาน");
                    return;
                  }
                  if (dueDate && editForm.dueAt > dueDate) {
                    setEditError(
                      `กำหนดส่งงานย่อยต้องไม่เกินกำหนดส่งเรื่องหลัก (${formatDate(dueDate)})`,
                    );
                    return;
                  }
                  setEditError(null);
                  setShowEditConfirm(true);
                }}
                disabled={
                  updateLoading || !editForm.title.trim() || !editForm.dueAt
                }
                className="rounded-lg bg-[#366DBD] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-60"
              >
                บันทึก
              </button>
            </div>
          </div>
        )}
      </AdminModalShell>

      <div className="flex flex-1 flex-col gap-5 bg-[#F0F4FA] p-4 sm:p-6 lg:p-8">
        {/* Header */}
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
                มอบหมายงาน
              </h1>
              <p className="text-[13px] text-gray-500">
                เลือกเจ้าหน้าที่เพื่อมอบหมายงานย่อย
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`${API_BASE_URL}/requests/${effectiveRequestId}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50"
            >
              <FileText size={15} />
              ดูเอกสาร
            </a>

            <button
              type="button"
              onClick={() => setShowForwardConfirm(true)}
              disabled={!canSubmit}
              className="rounded-lg bg-[#366DBD] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ส่งต่อ
            </button>
          </div>
        </div>

        {loading ? (
          showSkeleton ? (
            <div className="flex min-h-[680px] gap-6 animate-pulse">
              <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="h-7 w-2/3 rounded-lg bg-gray-200" />
                  <div className="h-6 w-24 rounded-full bg-gray-200" />
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-40 rounded-full bg-gray-200" />
                  <div className="h-8 w-32 rounded-full bg-gray-200" />
                </div>
                <div className="h-56 w-full rounded-xl bg-gray-100" />
              </div>
              <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
                <div className="flex gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-gray-100 py-4"
                    >
                      <div className="h-6 w-10 rounded bg-gray-200" />
                      <div className="h-3 w-16 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
                <div className="h-9 w-full rounded-lg bg-gray-200" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2"
                  >
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                    <div className="h-3 w-2/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          ) : null
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-300 bg-white p-8 text-gray-400 min-h-[680px]">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row min-h-[680px] gap-6">
            {/* ── Left panel ── */}
            <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
              {/* Title + type */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {data.title}
                </h2>
                <span className="shrink-0 rounded-full border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[12px] font-medium text-[#D9534F]">
                  {data.problemName}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-500">
                <p>หมายเลขแจ้ง : {data.requestNo}</p>
                <p>ผู้ใช้งานภายในองค์กร : {data.customerName}</p>
                <p>ระบบ : {data.systemName}</p>
              </div>

              <textarea
                readOnly
                value={data.detail}
                rows={12}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 outline-none"
              />

              {data.wasReopened ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReopenModal(true)}
                    className="rounded-lg border border-[#F4A0A0] bg-[#FFF0F0] px-4 py-2 text-[14px] font-semibold text-[#D9534F] hover:bg-[#FFF5F5] transition-colors"
                  >
                    ดูการตีกลับล่าสุด
                  </button>
                </div>
              ) : null}

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[13px] font-medium text-gray-500">
                    ไฟล์แนบ ({attachments.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {attachments.map((file) => {
                      const fileName = file.savedName ?? file.originalName;
                      const url = `${API_BASE_URL}/uploads/requests/${fileName}`;
                      const ext = (file.fileExt ?? "").toLowerCase();
                      const isImage = IMAGE_EXTS.includes(ext);
                      const nameNoExt = file.originalName.replace(
                        new RegExp(`\\.${ext}$`, "i"),
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
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right panel ── */}
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-800">งานย่อย</h3>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: <FileText size={16} className="text-[#366DBD]" />,
                    value: tickets.length,
                    label: "งานย่อย",
                    bg: "bg-[#EEF4FF]",
                  },
                  {
                    icon: <Users size={16} className="text-[#7C3AED]" />,
                    value: uniqueAssignees,
                    label: "ผู้รับผิดชอบ",
                    bg: "bg-purple-50",
                  },
                  {
                    icon: <Clock size={16} className="text-[#C47F00]" />,
                    value: formatBangkokTimeLeft(
                      dueDate ?? null,
                      data?.status ?? "",
                      {
                        closedLabel: "ส่งงานแล้ว",
                        emptyLabel: "ไม่กำหนด",
                        overdueLabel: "เกินกำหนด",
                      },
                    ),
                    label: "ครบกำหนด",
                    bg: "bg-[#FFF8EC]",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl py-3 ${stat.bg}`}
                  >
                    {stat.icon}
                    <span className="text-[18px] font-bold text-gray-800">
                      {stat.value}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Due date */}
              <div className="flex items-center gap-3">
                <label className="text-[14px] font-semibold text-gray-700 whitespace-nowrap">
                  กำหนดวันส่ง
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={localToday}
                  className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
                />
              </div>

              {/* Toolbar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subSearch}
                  onChange={(e) => {
                    setSubSearch(e.target.value);
                    setSubPage(1);
                  }}
                  placeholder="ค้นหางานย่อย..."
                  className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] outline-none focus:border-[#366DBD] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setSubPage(1)}
                  className="h-9 rounded-lg bg-[#366DBD] px-4 text-[13px] font-semibold text-white hover:bg-[#2d5da3]"
                >
                  ค้นหา
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/consideration/issue-work/${effectiveRequestId}/assign?mainDue=${dueDate}`,
                    )
                  }
                  className="h-9 rounded-lg border border-[#366DBD] px-4 text-[13px] font-semibold text-[#366DBD] hover:bg-blue-50"
                >
                  + เพิ่ม
                </button>
              </div>

              <div className="flex flex-col gap-3 ">
                {pagedSub.length === 0 && (
                  <p className="py-10 text-center text-gray-400">
                    ยังไม่มีงานย่อยที่ต้องดำเนินการ
                  </p>
                )}
                {pagedSub.map((task) => (
                  <div
                    key={task.id}
                    className="text-[15px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="rounded-md border border-gray-200 px-3 py-0.5 text-[13px] text-gray-700 w-fit">
                        {task.assignedStaffName ?? "ยังไม่มอบหมาย"}
                      </span>
                      <p className="text-[17px] px-2 text-gray-500 mt-6">
                        {task.title}
                      </p>

                      {/* แสดงเหตุผลการตีกลับล่าสุด (ถ้ามี) */}
                      {task.rejectReason && (
                        <p className="mt-2 text-[13px] text-[#D9534F] bg-[#FFF0F0] border border-[#F4A0A0] px-3 py-1.5 rounded-lg w-fit ml-2">
                          เหตุผลที่ตีกลับ: {task.rejectReason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto shrink-0 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                      {task.status === "resolved" ||
                      task.status === "closed" ? (
                        <span className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-[13px] font-semibold text-green-700">
                          เสร็จสิ้น
                        </span>
                      ) : (
                        <>
                          <span className="text-[17px] text-gray-500">
                            {task.dueAt
                              ? (() => {
                                  const taskDate = new Date(task.dueAt);
                                  taskDate.setHours(0, 0, 0, 0);
                                  const todayDate = new Date();
                                  todayDate.setHours(0, 0, 0, 0);
                                  const days = Math.ceil(
                                    (taskDate.getTime() - todayDate.getTime()) /
                                      86400000,
                                  );
                                  if (days === 0) {
                                    return (
                                      <span className="text-gray-400">
                                        วันนี้
                                      </span>
                                    );
                                  }
                                  return days > 0 ? (
                                    <span className="text-gray-400">
                                      เหลือ {days} วัน
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      เกินกำหนด {Math.abs(days)} วัน
                                    </span>
                                  );
                                })()
                              : ""}
                          </span>
                          <div className="flex gap-1 mt-6">
                            <button
                              type="button"
                              onClick={() => openEditModal(task.id)}
                              className="rounded-md border border-gray-300 px-3 text-[14px] text-gray-600 hover:bg-gray-50"
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(task.id)}
                              className="rounded-md bg-[#D9534F] px-3  text-[14px] text-white hover:bg-red-600"
                            >
                              ยกเลิกงาน
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                {/* Pagination */}
                {totalSubPages > 1 && (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                      disabled={subPage === 1}
                      className="flex h-8 items-center gap-1 rounded-md px-2 text-[13px] text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    {Array.from({ length: totalSubPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setSubPage(p)}
                          className={`flex h-8 w-8 items-center justify-center rounded-md border text-[13px] ${
                            subPage === p
                              ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                              : "border-transparent text-gray-600 hover:border-[#7FA7E8]"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        setSubPage((p) => Math.min(totalSubPages, p + 1))
                      }
                      disabled={subPage === totalSubPages}
                      className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
                <div className="mt-auto flex justify-end pt-4">
                  <button
                    type="button"
                    disabled={dueDateLoading || !editedDueDate}
                    onClick={() => setShowDueDateConfirm(true)}
                    className="rounded-lg bg-[#366DBD] px-6 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-50"
                  >
                    {dueDateLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <AdminModalShell
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
        title="ยืนยันการยกเลิกงาน"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-[#F59E0B]">
              <TriangleAlert size={28} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            คุณต้องการยกเลิกงานย่อยนี้ใช่หรือไม่?
          </p>

          <div className="flex w-full justify-center gap-3 pt-1">
            <ProTechButton
              variant="delete"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              onClick={() => setDeleteConfirmId(null)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              onClick={() => {
                if (deleteConfirmId !== null) {
                  void deleteTicket(deleteConfirmId, staffId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              ยืนยันการยกเลิก
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Edit confirmation dialog */}
      <AdminModalShell
        open={showEditConfirm}
        onOpenChange={setShowEditConfirm}
        title="ยืนยันการแก้ไข"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-[#F59E0B]">
              <TriangleAlert size={28} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            คุณต้องการบันทึกการเปลี่ยนแปลงของงานย่อยนี้ใช่หรือไม่?
          </p>

          <div className="flex w-full justify-center gap-3 pt-1">
            <ProTechButton
              variant="delete"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              onClick={() => setShowEditConfirm(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              onClick={async () => {
                setShowEditConfirm(false);
                await handleSaveEdit();
              }}
              disabled={updateLoading}
            >
              ยืนยัน
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Edit success dialog */}
      <AdminModalShell
        open={showEditSuccess}
        onOpenChange={setShowEditSuccess}
        title="บันทึกสำเร็จ"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
              <CheckCircle2 size={34} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            บันทึกการเปลี่ยนแปลงงานย่อยเรียบร้อยแล้ว
          </p>

          <div className="flex justify-center pt-1">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => setShowEditSuccess(false)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Cancel success dialog */}
      <AdminModalShell
        open={showCancelSuccess}
        onOpenChange={setShowCancelSuccess}
        title="ยกเลิกงานสำเร็จ"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
              <CheckCircle2 size={34} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            ยกเลิกงานย่อยเรียบร้อยแล้ว
          </p>

          <div className="flex justify-center pt-1">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => setShowCancelSuccess(false)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Request due date confirmation dialog */}
      <AdminModalShell
        open={showDueDateConfirm}
        onOpenChange={setShowDueDateConfirm}
        title="ยืนยันการเปลี่ยนกำหนดวันส่ง"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-[#F59E0B]">
              <TriangleAlert size={28} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            คุณต้องการเปลี่ยนวันส่งของเรื่องหลักนี้ใช่หรือไม่?
            (วันส่งของงานย่อยที่ยังไม่ได้เริ่มและเกินกำหนดจะถูกปรับลดให้อัตโนมัติ)
          </p>

          <div className="flex w-full justify-center gap-3 pt-1">
            <ProTechButton
              variant="delete"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              onClick={() => setShowDueDateConfirm(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              disabled={!editedDueDate}
              onClick={async () => {
                setShowDueDateConfirm(false);
                if (editedDueDate) {
                  await updateDueDate(effectiveRequestId, editedDueDate);
                  setShowDueDateSuccess(true);
                  refetch();
                }
              }}
            >
              ยืนยัน
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Request due date success dialog */}
      <AdminModalShell
        open={showDueDateSuccess}
        onOpenChange={setShowDueDateSuccess}
        title="เปลี่ยนกำหนดส่งสำเร็จ"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
              <CheckCircle2 size={34} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            เปลี่ยนวันกำหนดส่งของเรื่องหลักและปรับวันส่งงานย่อยเรียบร้อยแล้ว
          </p>

          <div className="flex justify-center pt-1">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => setShowDueDateSuccess(false)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Forward request confirmation dialog */}
      <AdminModalShell
        open={showForwardConfirm}
        onOpenChange={setShowForwardConfirm}
        title="ยืนยันการส่งต่อ"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-[#F59E0B]">
              <TriangleAlert size={28} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            คุณต้องการส่งต่องานนี้ใช่หรือไม่?
          </p>

          <div className="flex w-full justify-center gap-3 pt-1">
            <ProTechButton
              variant="delete"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              onClick={() => setShowForwardConfirm(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 flex-1 min-w-0 sm:flex-none sm:min-w-30"
              onClick={async () => {
                setShowForwardConfirm(false);
                await handleSave();
              }}
            >
              ยืนยัน
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Forward success dialog */}
      <AdminModalShell
        open={showForwardSuccess}
        onOpenChange={(open) => {
          if (!open) {
            setShowForwardSuccess(false);
            router.push(`/consideration/issue-work`);
          }
        }}
        title="ส่งต่อสำเร็จ"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
              <CheckCircle2 size={34} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            ส่งต่อการดำเนินการเรียบร้อยแล้ว
          </p>

          <div className="flex justify-center pt-1">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => {
                setShowForwardSuccess(false);
                router.push(`/consideration/issue-work`);
              }}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Reopen comment modal */}
      <AdminModalShell
        open={showReopenModal}
        onOpenChange={setShowReopenModal}
        title="การตีกลับล่าสุด"
        widthClassName="max-w-[480px]"
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-[14px]">
            <p className="font-semibold text-gray-700 mb-1">
              ความคิดเห็นการตีกลับ
            </p>
            <p className="text-gray-600 whitespace-pre-wrap text-left indent-8">
              {data?.latestReopenComment || "-"}
            </p>
          </div>

          {reopenFiles.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-[14px]">
              <p className="font-semibold text-gray-700 mb-2">
                ไฟล์แนบการตีกลับ ({reopenFiles.length})
              </p>
              <div className="flex flex-col gap-2">
                {reopenFiles.map((file) => {
                  const fileName = file.savedName ?? file.originalName;
                  const url = `${API_BASE_URL}/uploads/requests/${fileName}`;
                  const isImage = IMAGE_EXTS.includes(
                    (file.fileExt ?? "").toLowerCase(),
                  );
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => {
                        if (isImage) {
                          setLightbox(url);
                        } else {
                          window.open(url, "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-[#366DBD] hover:bg-[#F8FBFF] w-full"
                    >
                      {isImage ? (
                        <ImageIcon
                          size={18}
                          className="shrink-0 text-[#2F66C5]"
                        />
                      ) : (
                        <FileText
                          size={18}
                          className="shrink-0 text-[#D1435B]"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-gray-800">
                          {file.originalName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-1">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-30"
              onClick={() => setShowReopenModal(false)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </>
  );
}
