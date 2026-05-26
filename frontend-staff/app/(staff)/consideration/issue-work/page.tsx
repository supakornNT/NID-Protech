"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useIssueWork } from "@/hooks/use-issue-work";

const LIMIT = 4;

export default function IssueWorkPage() {
  const router = useRouter();
  const { rows, loading } = useIssueWork();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = rows.filter(
    (item) =>
      search === "" ||
      item.title.includes(search) ||
      item.systemName.includes(search) ||
      item.customerName.includes(search) ||
      item.customerSurname.includes(search),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function getVisiblePages() {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 1, totalPages - 4));
    return Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i);
  }

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
        กำลังโหลด...
      </div>
    );

  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-8">
      <div>
        <h1 className="text-[32px] font-bold text-gray-900">การจัดการงาน</h1>
        <p className="text-[16px] text-gray-500">งานที่ต้องมอบหมาย</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ค้นหาระบบ..."
            className="h-9 w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[14px] outline-none focus:border-[#366DBD] focus:ring-2 focus:ring-[#366DBD]/10"
          />
        </div>
        <button
          type="button"
          className="h-9 rounded-lg bg-[#366DBD] px-5 text-[14px] font-semibold text-white transition hover:bg-[#2d5da3]"
        >
          ค้นหา
        </button>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[#7FA7E8] bg-white">
        {paged.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#7FA7E8]">
            {paged.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white px-6 py-5"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-[17px] font-bold text-gray-900">{item.title}</p>
                    {!!item.wasRejected && (
                      <span className="rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
                        ถูกตีกลับ
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-gray-500">ผู้แจ้ง : {item.customerName} {item.customerSurname}</p>
                  <p className="text-[14px] text-gray-500">ระบบ : {item.systemName}</p>
                  <span className="mt-1 inline-flex w-fit rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[13px] text-[#D9534F]">
                    {item.problemName}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[14px]">
                    ประเภท :{" "}
                    <span className={`font-bold ${item.probleTypeName === "issue" ? "text-[#D9534F]" : "text-[#D4A017]"}`}>
                      {item.probleTypeName === "issue" ? "ปัญหา" : "ร้องเรียน"}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/consideration/issue-work/${item.id}`)}
                    className="mt-1 rounded-lg border border-[#929396] bg-white px-5 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50"
                  >
                    จัดการ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
