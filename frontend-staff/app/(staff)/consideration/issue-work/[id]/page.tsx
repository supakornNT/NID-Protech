"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
import { useState } from "react";
import Image from "next/image";
import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import { useTicketsByRequest } from "@/hooks/use-tickets-by-request";
import { useUpdateRequestStatus } from "@/hooks/use-update-request-status";

const SUBTASK_LIMIT = 4;

export default function ManageWorkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, attachments, loading } = useComplaintDetail(id);
  const { lightbox, setLightbox } = useLightbox();
  const { tickets } = useTicketsByRequest(id);
  const { updateStatus } = useUpdateRequestStatus();
  const [subPage, setSubPage] = useState(1);
  const [editedDueDate, setDueDate] = useState<string | undefined>(undefined);
  const dueDate = editedDueDate ?? (data?.resolvedAt ? data.resolvedAt.slice(0, 10) : "");
  const totalSubPages = Math.max(1, Math.ceil(tickets.length / SUBTASK_LIMIT));
  const pagedSub = tickets.slice((subPage - 1) * SUBTASK_LIMIT, subPage * SUBTASK_LIMIT);
  async function handleSave() {
    await updateStatus(id, "in_progress");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = dueDate
    ? Math.max(0, Math.ceil((new Date(dueDate).getTime() - today.getTime()) / 86400000))
    : null;

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
        กำลังโหลด...
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
        ไม่พบข้อมูล
      </div>
    );

  return (
    <>
    {lightbox && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={() => setLightbox(null)}
      >
        <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setLightbox(null)}>
          <X size={32} />
        </button>
        <div onClick={(e) => e.stopPropagation()}>
          <Image src={lightbox} alt="preview" width={900} height={700} unoptimized className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
        </div>
      </div>
    )}
    <div className="flex flex-1 flex-col gap-4 bg-[#F0F4FA] p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">การจัดการงาน</h1>
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
            className="rounded-lg bg-[#366DBD] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
          >
            ส่งมอบ
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-16">
        {/* Left panel */}
        <div className="flex flex-1 flex-shrink-0 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
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
            rows={8}
            className="w-full resize-none rounded-lg border border-[#000000] bg-gray-50 p-3 text-l text-gray-700 outline-none"
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-l text-gray-500">ไฟล์แนบ ({attachments.length})</p>
              <div className="flex flex-wrap gap-3">
                {attachments.map((file) => {
                  const url = `http://localhost:4000/uploads/reports/${file.savedName}.${file.fileExt}`;
                  const isImage = IMAGE_EXTS.includes((file.fileExt ?? "").toLowerCase());
                  return isImage ? (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setLightbox(url)}
                      className="overflow-hidden rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                    >
                      <Image src={url} alt={file.originalName} width={128} height={128} unoptimized className="h-32 w-32 object-cover" />
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
                      <span className="w-full truncate px-2 text-center">{file.originalName}</span>
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
              { value: 3, label: "ผู้รับผิดชอบ" },
              { value: daysLeft !== null ? `${daysLeft} วัน` : "ยังไม่กำหนด", label: "ครบกำหนด" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#000000] py-4"
              >
                <span className="text-[28px] font-bold text-gray-800">{stat.value}</span>
                <span className="text-[13px] text-gray-500">{stat.label}</span>
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
              placeholder="ค้นหา..."
              className="h-9 flex-1 rounded-lg border border-[#000000] bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
            />
            <button
              type="button"
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

          {/* Sub-task list */}
          <div className="flex flex-col gap-3">
            {pagedSub.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between rounded-xl border border-[#000000] p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="rounded-md border border-gray-300 px-3 py-0.5 text-[13px] text-gray-700 w-fit">
                    {task.assignedStaffName ?? "ยังไม่มอบหมาย"}
                  </span>
                  <p className="text-[13px] text-gray-500 mt-1">{task.title}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[13px] text-gray-500">{task.status}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 px-3 py-1 text-[12px] text-gray-600 hover:bg-gray-50"
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-[#D9534F] px-3 py-1 text-[12px] text-white hover:bg-red-600"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sub-task pagination */}
          <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
            <button
              onClick={() => setSubPage((p) => Math.max(1, p - 1))}
              disabled={subPage === 1}
              className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {Array.from({ length: totalSubPages }, (_, i) => i + 1).map((p) => (
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
            ))}
            <button
              onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
              disabled={subPage === totalSubPages}
              className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-auto">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#366DBD] px-6 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
