"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type WorkItem = {
  id: number;
  title: string;
  user: string;
  system: string;
  category: string;
  type: string;
  screenedBy: string;
};

const mockData: WorkItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: "ไม่สามารถเพิ่มรายชื่อนักเรียนได้",
  user: "นายสมชาย ตอนเจดีย์",
  system: "นักเรียน",
  category: "ปัญหา",
  type: "บัค",
  screenedBy: "สมชาย ตอนเจดีย์",
}));

const LIMIT = 4;

export default function IssueWorkPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = mockData.filter(
    (item) =>
      search === "" ||
      item.title.includes(search) ||
      item.system.includes(search),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function getVisiblePages() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 1, totalPages - 4));
    return Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-bold text-gray-900">การจัดการงาน</h1>
        <p className="text-[16px] text-gray-500">งานที่ต้องมอบหมาย</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-[33px] w-[222px] rounded-md border border-[#929396] bg-white px-3 text-sm outline-none"
        />
        <button type="button" className="h-[31px] w-[74px] rounded-md bg-[#366DBD] text-[13px] font-bold text-white">
          ค้นหา
        </button>

        <div className="ml-auto flex items-center gap-2">
          {["ประเภททั้งหมด", "ระบบทั้งหมด", "เวลา"].map((label) => (
            <button
              key={label}
              type="button"
              className="flex h-[33px] items-center gap-1 rounded-md border border-[#929396] bg-white px-3 text-[14px] text-gray-600"
            >
              {label} <span className="text-xs">∧</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {paged.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-[#D6E4F7] bg-white px-6 py-5 shadow-sm"
          >
            {/* Left */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[17px] font-bold text-gray-900">{item.title}</p>
              <p className="text-[14px] text-gray-500">
                ผู้ใช้งานภายในองค์กร : {item.user}
              </p>
              <p className="text-[14px] text-gray-500">ระบบ : {item.system}</p>
              <span className="mt-1 inline-flex w-fit rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[13px] text-[#D9534F]">
                {item.category}
              </span>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-2">
              <p className="text-[14px]">
                ประเภท : <span className="font-bold text-[#D9534F]">{item.type}</span>
              </p>
              <p className="text-[14px] text-gray-500">คัดกรอง โดย {item.screenedBy}</p>
              <button
                type="button"
                className="mt-1 rounded-lg border border-[#929396] bg-white px-5 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50"
              >
                จัดการ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex h-9 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {getVisiblePages().map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-all ${
              page === p
                ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                : "border-transparent text-gray-600 hover:border-[#7FA7E8] hover:text-[#3A6FCF]"
            }`}
          >
            {p}
          </button>
        ))}

        {totalPages > 3 && <span className="px-1 text-gray-400">...</span>}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex h-9 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
