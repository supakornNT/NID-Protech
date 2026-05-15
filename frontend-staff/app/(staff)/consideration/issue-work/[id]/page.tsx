"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { useComplaintDetail } from "@/hooks/use-complaint-detail";

const SUBTASK_LIMIT = 2;

type SubTask = {
  id: number;
  assignee: string;
  description: string;
  daysLeft: number;
};

const mockSubTasks: SubTask[] = [
  { id: 1, assignee: "นายศุภกร ลีลานางกุล", description: "ตรวจ even listening", daysLeft: 2 },
  { id: 2, assignee: "นายศุภกร ลีลานางกุล", description: "ตรวจ even listening", daysLeft: 1 },
];

export default function ManageWorkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, attachments, loading } = useComplaintDetail(id);
  const [subTasks] = useState<SubTask[]>(mockSubTasks);
  const [subPage, setSubPage] = useState(1);

  const totalSubPages = Math.max(1, Math.ceil(subTasks.length / SUBTASK_LIMIT));
  const pagedSub = subTasks.slice((subPage - 1) * SUBTASK_LIMIT, subPage * SUBTASK_LIMIT);

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
      <div className="flex gap-4">
        {/* Left panel */}
        <div className="flex w-[420px] flex-shrink-0 flex-col gap-4 rounded-2xl border border-[#D6E4F7] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-[17px] font-bold text-gray-900">{data.title}</p>
            <span className="ml-3 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[13px] text-[#D9534F]">
              {data.problemName}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[14px] text-gray-500">
            <p>ผู้ใช้งานภายในองค์กร : {data.customerName}</p>
            <p>ระบบ : {data.systemName}</p>
          </div>

          <textarea
            readOnly
            value={data.detail}
            rows={6}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-[14px] text-gray-700 outline-none"
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] text-gray-500">ไฟล์แนบ ({attachments.length})</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file) => {
                  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
                    file.file_ext.toLowerCase(),
                  );
                  const fileName = file.saved_name ?? file.original_name;
                  return (
                    <a
                      key={file.id}
                      href={`http://localhost:4000/uploads/requests/${fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[12px] text-gray-600 hover:bg-gray-100"
                    >
                      {isImage ? <ImageIcon size={13} /> : <FileText size={13} />}
                      {file.original_name}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#D6E4F7] bg-white p-6 shadow-sm">
          {/* Stats */}
          <div className="flex gap-4">
            {[
              { value: subTasks.length, label: "งานย่อย" },
              { value: 3, label: "ผู้รับผิดชอบ" },
              { value: "3 วัน", label: "ครบกำหนด" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#D6E4F7] py-4"
              >
                <span className="text-[28px] font-bold text-gray-800">{stat.value}</span>
                <span className="text-[13px] text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Sub-task toolbar */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ค้นหา..."
              className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
            />
            <button
              type="button"
              className="h-9 rounded-lg bg-[#366DBD] px-4 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
            >
              ค้นหา
            </button>
            <button
              type="button"
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
                className="flex items-start justify-between rounded-xl border border-[#D6E4F7] p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="rounded-md border border-gray-300 px-3 py-0.5 text-[13px] text-gray-700 w-fit">
                    {task.assignee}
                  </span>
                  <p className="text-[13px] text-gray-500 mt-1">{task.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[13px] text-gray-500">เหลือ {task.daysLeft} วัน</span>
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
              className="rounded-lg bg-[#366DBD] px-6 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
