"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
import { useRef, useState } from "react";
import Image from "next/image";
import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import { useTicketsByRequest } from "@/hooks/use-tickets-by-request";
import { useUpdateRequestStatus } from "@/hooks/use-update-request-status";
import { useUpdateTicket } from "@/hooks/assign/use-update-ticket";
import { useDeleteTicket } from "@/hooks/assign/use-delete-ticket";
import { useUpdateRequestDueDate } from "@/hooks/use-update-request-due-date";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { useRequestStatusLog } from "@/hooks/use-request-status-log";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  const { data, attachments, loading } = useComplaintDetail(id);
  const { lightbox, setLightbox } = useLightbox();
  const { tickets, refetch } = useTicketsByRequest(id);
  const { updateStatus } = useUpdateRequestStatus();
  const { logStatus } = useRequestStatusLog(0);
  const { updateDueDate, loading: dueDateLoading } = useUpdateRequestDueDate();
  const [subPage, setSubPage] = useState(1);
  const [subSearch, setSubSearch] = useState("");
  const [editedDueDate, setDueDate] = useState<string | undefined>(undefined);
  const dueDate =
    editedDueDate ??
    (data?.dueAt ? new Date(data.dueAt).toLocaleDateString("en-CA") : "");
  const filteredSub = tickets.filter(
    (t) =>
      subSearch === "" ||
      t.title.includes(subSearch) ||
      (t.assignedStaffName ?? "").includes(subSearch),
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

  const { updateTicket, loading: updateLoading } = useUpdateTicket(() => {
    setEditModal({
      open: false,
      ticketId: null,
      detail: null,
      detailLoading: false,
    });
    refetch();
  });

  const { deleteTicket } = useDeleteTicket(() => {
    refetch();
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  async function openEditModal(ticketId: number) {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setEditModal({ open: true, ticketId, detail: null, detailLoading: true });
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/tickets/id?id=${ticketId}`,
        { signal: controller.signal },
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
    if (!editModal.ticketId) return;
    await updateTicket(editModal.ticketId, {
      title: editForm.title,
      description: editForm.description,
      dueAt: editForm.dueAt || undefined,
    });
  }

  async function handleSave() {
    const requestId = Number(Array.isArray(id) ? id[0] : id);

    if (editedDueDate) {
      await updateDueDate(requestId, editedDueDate);
    }

    await Promise.all([
      updateStatus(id, "in_progress"),
      logStatus(requestId, "assigned"),
    ]);
    router.push(`/consideration/issue-work`);
  }

  const canSubmit = !!dueDate && pagedSub.length > 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = dueDate
    ? Math.max(
        0,
        Math.ceil((new Date(dueDate).getTime() - today.getTime()) / 86400000),
      )
    : null;



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
            className="absolute top-4 right-4 text-white hover:text-gray-300"
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
                min={new Date().toISOString().split("T")[0]}
                className="rounded-lg border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setEditModal({
                    open: false,
                    ticketId: null,
                    detail: null,
                    detailLoading: false,
                  })
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updateLoading}
                className="rounded-lg bg-[#366DBD] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-60"
              >
                {updateLoading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        )}
      </AdminModalShell>
      <div className="flex flex-1 flex-col gap-4 bg-[#F0F4FA] p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              การจัดการงาน
            </h1>
            <p className="text-[14px] text-gray-500">งานที่ต้องมอบหมาย</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50"
            >
              <FileText size={15} /> ดูเอกสาร
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSubmit}
              className="rounded-lg bg-[#366DBD] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ส่งต่อ
            </button>
          </div>
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex min-h-[700px] gap-12 animate-pulse w-full">
            {/* Left panel skeleton */}
            <div className="flex flex-1 shrink-0 flex-col gap-5 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="h-7 w-3/4 rounded bg-gray-200" />
                <div className="h-6 w-28 rounded bg-gray-200" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
              </div>
              <div className="h-80 w-full rounded-lg bg-gray-100" />
            </div>

            {/* Right panel skeleton */}
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
              <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#000000] py-4 gap-2">
                    <div className="h-6 w-12 rounded bg-gray-200" />
                    <div className="h-3 w-16 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
              <div className="h-9 w-full rounded-lg bg-gray-200" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-[#000000] p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-5 w-24 rounded bg-gray-200" />
                      <div className="h-4 w-16 rounded bg-gray-200" />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center p-8 text-gray-500 bg-white rounded-2xl border border-[#000000] min-h-[700px]">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="flex min-h-[700px] gap-12">
            {/* Left panel */}
            <div className="flex flex-1 shrink-0 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-2xl font-bold text-gray-900">{data.title}</p>
              <span className="ml-3 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-l text-[#D9534F]">
                {data.problemName}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-l text-gray-500">
              <p>ผู้ใช้งานภายในองค์กร : {data.customerName}</p>
              <p>ระบบ : {data.systemName}</p>
            </div>

            <textarea
              readOnly
              value={data.detail}
              rows={12}
              className="w-full resize-none rounded-lg border border-[#000000] bg-gray-50 p-3 text-l text-gray-700 outline-none"
            />

            {attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-l text-gray-500">
                  ไฟล์แนบ ({attachments.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((file) => {
                    const url = `${API_BASE_URL}/uploads/reports/${file.savedName}.${file.fileExt}`;
                    const isImage = IMAGE_EXTS.includes(
                      (file.fileExt ?? "").toLowerCase(),
                    );
                    return isImage ? (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => setLightbox(url)}
                        className="overflow-hidden rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src={url}
                          alt={file.originalName}
                          width={128}
                          height={128}
                          unoptimized
                          className="h-32 w-32 object-cover"
                        />
                      </button>
                    ) : (
                      <a
                        key={file.id}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-[12px] text-gray-500 hover:bg-gray-100"
                      >
                        <FileText size={32} className="text-gray-400" />
                        <span className="w-full truncate px-2 text-center">
                          {file.originalName}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
            {/* Stats */}
            <div className="flex gap-4">
              {[
                { value: tickets.length, label: "งานย่อย" },
                { value: uniqueAssignees, label: "ผู้รับผิดชอบ" },
                {
                  value: daysLeft !== null ? `${daysLeft} วัน` : "ยังไม่กำหนด",
                  label: "ครบกำหนด",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#000000] py-4"
                >
                  <span className="text-[22px] font-bold text-gray-800">
                    {stat.value}
                  </span>
                  <span className="text-[13px] text-gray-500">
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
                min={new Date().toISOString().split("T")[0]}
                className="h-9 rounded-lg border border-[#000000] bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
              />
            </div>

            {/* Sub-task toolbar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={subSearch}
                onChange={(e) => {
                  setSubSearch(e.target.value);
                  setSubPage(1);
                }}
                placeholder="ค้นหา..."
                className="h-9 flex-1 rounded-lg border border-[#000000] bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
              />
              <button
                type="button"
                onClick={() => setSubPage(1)}
                className="h-9 rounded-lg bg-[#366DBD] px-4 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
              >
                ค้นหา
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/consideration/issue-work/${Array.isArray(id) ? id[0] : id}/assign`,
                  )
                }
                className="h-9 rounded-lg border border-[#366DBD] px-4 text-[14px] font-semibold text-[#366DBD] hover:bg-blue-50"
              >
                + เพิ่ม
              </button>
            </div>

            {/* Sub-task list */}
            <div className="flex flex-col gap-3 ">
              {pagedSub.length === 0 && (
                <p className="py-10 text-center text-gray-400">ไม่มีข้อมูล</p>
              )}
              {pagedSub.map((task) => (
                <div
                  key={task.id}
                  className="text-[15px] flex items-start justify-between rounded-xl border border-[#000000] py-6 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="rounded-md border border-[#000000] px-3 py-0.5 text-[13px] text-gray-700 w-fit">
                      {task.assignedStaffName ?? "ยังไม่มอบหมาย"}
                    </span>
                    <p className="text-[17px] px-2 text-gray-500 mt-6">
                      {task.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[17px] text-gray-500">
                      {task.dueAt
                        ? (() => {
                            const days = Math.ceil(
                              (new Date(task.dueAt).getTime() - Date.now()) /
                                86400000,
                            );
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
                        onClick={() => deleteTicket(task.id)}
                        className="rounded-md bg-[#D9534F] px-3  text-[14px] text-white hover:bg-red-600"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination + Save button */}
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                <button
                  onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                  disabled={subPage === 1}
                  className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                {Array.from({ length: totalSubPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setSubPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm ${
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
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={dueDateLoading || !editedDueDate}
                  onClick={() => updateDueDate(id, editedDueDate!)}
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
  </>
);
}
