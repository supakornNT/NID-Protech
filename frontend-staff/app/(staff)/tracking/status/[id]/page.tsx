"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ImageIcon,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import { useTicketsByRequest } from "@/hooks/use-tickets-by-request";
import { useLoadingDelay } from "@/hooks/use-loading-delay";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const SUBTASK_LIMIT = 5;

const TICKET_STATUS_MAP: Record<
  string,
  { label: string; badge: string; accent: string }
> = {
  waiting_confirm: {
    label: "รอพิจารณา",
    badge: "border-[#E8A84C] bg-[#FFF8EC] text-[#C47F00]",
    accent: "bg-[#E8A84C]",
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    badge: "border-[#366DBD] bg-[#EEF4FF] text-[#366DBD]",
    accent: "bg-[#366DBD]",
  },
  resolved: {
    label: "เสร็จสิ้น",
    badge: "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]",
    accent: "bg-[#4CAF7D]",
  },
  closed: {
    label: "เสร็จสิ้น",
    badge: "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]",
    accent: "bg-[#4CAF7D]",
  },
};

const FALLBACK_STATUS = {
  label: "ไม่ระบุ",
  badge: "border-gray-300 bg-gray-50 text-gray-600",
  accent: "bg-gray-300",
};

const REQUEST_STATUS_MAP: Record<string, { label: string; style: string }> = {
  screening: { label: "รอคัดกรอง", style: "border-gray-300 bg-gray-50 text-gray-600" },
  assigned: { label: "รอดำเนินการ", style: "border-gray-300 bg-gray-50 text-gray-600" },
  in_progress: { label: "กำลังดำเนินการ", style: "border-[#366DBD] bg-[#EEF4FF] text-[#366DBD]" },
  waiting_confirm: { label: "รอตรวจสอบโดยลูกค้า", style: "border-[#E8A84C] bg-[#FFF8EC] text-[#C47F00]" },
  closed: { label: "เสร็จสิ้น", style: "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]" },
};

function calcDaysLeft(dueAt: string | null): string {
  if (!dueAt) return "ไม่กำหนด";
  const diff = new Date(dueAt).getTime() - Date.now();
  if (diff <= 0) return "เกินกำหนด";
  return `เหลือ ${Math.ceil(diff / 86400000)} วัน`;
}

export default function TrackingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const rawId = Array.isArray(id) ? id[0] : id;

  const { data, attachments, loading } = useComplaintDetail(id);
  const { lightbox, setLightbox } = useLightbox();
  const showSkeleton = useLoadingDelay(loading, 200);
  const { tickets, loading: ticketsLoading } = useTicketsByRequest(rawId);

  const [subPage, setSubPage] = useState(1);
  const [subSearch, setSubSearch] = useState("");

  const filteredSub = tickets.filter(
    (t) =>
      subSearch === "" ||
      t.title.includes(subSearch) ||
      (t.assignedStaffName ?? "").includes(subSearch),
  );
  const totalSubPages = Math.max(1, Math.ceil(filteredSub.length / SUBTASK_LIMIT));
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
        Math.ceil((new Date(requestDueDate).getTime() - today.getTime()) / 86400000),
      )
    : null;

  const reqStatus = data?.status
    ? (REQUEST_STATUS_MAP[data.status] ?? { label: data.status, style: "border-gray-300 bg-gray-50 text-gray-600" })
    : null;

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

      <div className="flex flex-1 flex-col gap-5 bg-[#F0F4FA] p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">การติดตามงาน</h1>
              <p className="text-[13px] text-gray-400">ดูรายละเอียดคำขอและงานย่อย</p>
            </div>
          </div>
          {reqStatus && (
            <span className={`rounded-full border px-4 py-1 text-[13px] font-medium ${reqStatus.style}`}>
              {reqStatus.label}
            </span>
          )}
        </div>

        {/* Main content */}
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
                    <div key={i} className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-gray-100 py-4">
                      <div className="h-6 w-10 rounded bg-gray-200" />
                      <div className="h-3 w-16 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
                <div className="h-9 w-full rounded-lg bg-gray-200" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
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
              {/* Title + problem type */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {data.title}
                </h2>
                <span className="shrink-0 rounded-full border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[12px] font-medium text-[#D9534F]">
                  {data.problemName}
                </span>
              </div>

              {/* Info chips */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[13px] text-gray-600">
                  <Users size={13} className="text-gray-400" />
                  {data.customerName}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C7D9F8] bg-[#EEF4FF] px-3 py-1 text-[13px] text-[#366DBD]">
                  {data.systemName}
                </span>
              </div>

              <div className="border-t border-gray-100" />

              {/* Detail */}
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium text-gray-500">รายละเอียดปัญหา</p>
                <textarea
                  readOnly
                  value={data.detail}
                  rows={10}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-[13px] text-gray-700 outline-none leading-relaxed"
                />
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[13px] font-medium text-gray-500">
                    ไฟล์แนบ ({attachments.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {attachments.map((file) => {
                      const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
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
                            <span className="truncate text-[13px] font-medium text-gray-800">{nameNoExt}</span>
                            <span className="text-[11px] text-gray-400">{ext.toUpperCase()}</span>
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
                            <span className="truncate text-[13px] font-medium text-gray-800">{nameNoExt}</span>
                            <span className="text-[11px] text-gray-400">{ext.toUpperCase()}</span>
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
                    value:
                      daysLeftRequest !== null
                        ? `${daysLeftRequest} วัน`
                        : "ไม่กำหนด",
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
                    <span className="text-[11px] text-gray-500">{stat.label}</span>
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
              </div>

              {/* Ticket list */}
              <div className="flex flex-col gap-2">
                {ticketsLoading ? (
                  <div className="py-10 text-center text-[13px] text-gray-400">
                    กำลังโหลด...
                  </div>
                ) : pagedSub.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                    <FileText size={32} className="opacity-30" />
                    <span className="text-[13px]">ไม่พบรายการ</span>
                  </div>
                ) : (
                  pagedSub.map((task) => {
                    const mapped = TICKET_STATUS_MAP[task.status] ?? FALLBACK_STATUS;
                    return (
                      <div
                        key={task.id}
                        className="flex overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                      >
                        {/* Left accent bar */}
                        <div className={`w-1 shrink-0 ${mapped.accent}`} />
                        <div className="flex flex-1 flex-col gap-1.5 px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-[12px] font-medium text-gray-700">
                              {task.assignedStaffName ?? "ยังไม่มอบหมาย"}
                            </span>
                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${mapped.badge}`}
                            >
                              {mapped.label}
                            </span>
                          </div>
                          <p className="text-[13px] text-gray-600 line-clamp-2">
                            {task.description || task.title}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock size={11} />
                            {calcDaysLeft(task.dueAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalSubPages > 1 && (
                <div className="mt-auto flex items-center justify-end gap-1">
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
                    onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
                    disabled={subPage === totalSubPages}
                    className="flex h-8 items-center gap-1 rounded-md px-2 text-[13px] text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
