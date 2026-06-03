"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import Image from "next/image";
import { useStaffSession } from "@/contexts/staff-session-context";
import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import { useTicketsByRequest } from "@/hooks/use-tickets-by-request";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const SUBTASK_LIMIT = 4;

const TICKET_STATUS_MAP: Record<string, { label: string; style: string }> = {
  waiting_confirm: {
    label: "รอพิจารณา",
    style: "border-[#E8A84C] bg-[#FFF8EC] text-[#C47F00]",
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    style: "border-[#366DBD] bg-[#EEF4FF] text-[#366DBD]",
  },
  resolved: {
    label: "เสร็จสิ้น",
    style: "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]",
  },
  closed: {
    label: "เสร็จสิ้น",
    style: "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]",
  },
};

function calcDaysLeft(dueAt: string | null): string {
  if (!dueAt) return "—";
  const diff = new Date(dueAt).getTime() - Date.now();
  if (diff <= 0) return "เกินกำหนด";
  return `เหลือ ${Math.ceil(diff / 86400000)} วัน`;
}

export default function TrackingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { staff } = useStaffSession();

  const { data, attachments, loading } = useComplaintDetail(id);
  const { lightbox, setLightbox } = useLightbox();
  const { tickets, loading: ticketsLoading } = useTicketsByRequest(id);

  const [subPage, setSubPage] = useState(1);
  const [subSearch, setSubSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const allResolved =
    tickets.length > 0 &&
    tickets.every((t) =>
      ["resolved", "waiting_confirm", "closed"].includes(t.status),
    );
  const currentStatus = requestStatus ?? data?.status ?? "";
  const canSubmit = allResolved && currentStatus !== "waiting_confirm" && currentStatus !== "closed";

  async function handleSubmitWork() {
    if (!data) return;
    const staffId =
      typeof staff?.id === "number" ? staff.id : Number(staff?.id);

    if (!staffId) {
      window.dispatchEvent(new CustomEvent("session:expired"));
      throw new Error("ไม่พบข้อมูลเจ้าหน้าที่ กรุณาเข้าสู่ระบบใหม่");
    }

    await fetch(`${API_BASE_URL}/requests/${data.id}/submit-work`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId }),
    });
    setRequestStatus("waiting_confirm");
  }

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const requestDueDate = data?.dueAt
    ? new Date(data.dueAt).toLocaleDateString("en-CA")
    : "";
  const daysLeftRequest = requestDueDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(requestDueDate).getTime() - today.getTime()) / 86400000,
        ),
      )
    : null;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
        กำลังโหลด...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
        ไม่พบข้อมูล
      </div>
    );
  }

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

      <div className="flex flex-1 flex-col gap-4 bg-[#F0F4FA] p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              การจัดการงาน
            </h1>
            <p className="text-[14px] text-gray-500">
              ติดตามสถานะการดำเนินการ / ดูรายละเอียด
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex min-h-[700px] gap-12">
          {/* Left panel — request detail (read-only) */}
          <div className="flex flex-1 shrink-0 flex-col gap-4  rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-2xl font-bold text-gray-900">{data.title}</p>
              <span className="ml-3 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-sm text-[#D9534F]">
                ประเภท : {data.problemName}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-sm text-gray-500">
              <p>ผู้ใช้งานภายในองค์กร : {data.customerName}</p>
              <p>ระบบ : {data.systemName}</p>
            </div>

            <textarea
              readOnly
              value={data.detail}
              rows={12}
              className="w-full resize-none rounded-lg border border-[#000000] bg-gray-50 p-3 text-sm text-gray-700 outline-none"
            />

            {attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  ไฟล์แนบ ({attachments.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((file) => {
                    const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
                    const isImage = IMAGE_EXTS.includes(
                      (file.fileExt ?? "").toLowerCase(),
                    );
                    return isImage ? (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => setLightbox(url)}
                        className="overflow-hidden rounded-lg border border-gray-200 transition-opacity hover:opacity-80"
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

          {/* Right panel — tickets (read-only) */}
          <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
            {/* Stats */}
            <div className="flex gap-4">
              {[
                { value: tickets.length, label: "งานย่อย" },
                { value: uniqueAssignees, label: "ผู้รับผิดชอบ" },
                {
                  value:
                    daysLeftRequest !== null
                      ? `${daysLeftRequest} วัน`
                      : "ยังไม่กำหนด",
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

            {/* Search */}
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
                onClick={() => router.push(`/consideration/issue-work/${Array.isArray(id) ? id[0] : id}/assign`)}
                className="h-9 rounded-lg border border-[#366DBD] px-4 text-[14px] font-semibold text-[#366DBD] hover:bg-blue-50"
              >
                + เพิ่ม
              </button>
            </div>

            {/* Ticket list */}
            <div className="flex flex-col gap-3">
              {ticketsLoading ? (
                <div className="py-8 text-center text-[13px] text-gray-400">
                  กำลังโหลด...
                </div>
              ) : pagedSub.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-gray-400">
                  ไม่พบรายการ
                </div>
              ) : (
                pagedSub.map((task) => {
                  const mapped =
                    TICKET_STATUS_MAP[task.status] ?? TICKET_STATUS_MAP["open"];
                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-[#000000] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-md border border-[#000000] px-3 py-0.5 text-[13px] text-gray-700">
                          {task.assignedStaffName ?? "ยังไม่มอบหมาย"}
                        </span>
                        <span className="text-[12px] text-gray-400">
                          {calcDaysLeft(task.dueAt)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <p className="text-[13px] text-gray-500 line-clamp-2">
                          {task.description || task.title}
                        </p>
                        <span
                          className={`shrink-0 rounded-md border px-2.5 py-0.5 text-[12px] ${mapped.style}`}
                        >
                          {mapped.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="mt-auto flex items-center justify-end gap-1 text-sm text-gray-600">
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
              {totalSubPages > 3 && (
                <span className="px-1 text-gray-400">...</span>
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
          </div>
        </div>
      </div>
    </>
  );
}
