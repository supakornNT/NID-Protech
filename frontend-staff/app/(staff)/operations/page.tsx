"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useMyWork } from "@/hooks/use-my-work";

const LIMIT = 4;


const TYPE_LABEL: Record<string, string> = {
  issue:     "ปัญหา",
  complaint: "ร้องเรียน",
  service:   "บริการ",
};

export default function OperationsPage() {
  const router = useRouter();
  const { items, loading, error } = useMyWork(1);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ทั้งหมด");
  const [systemFilter, setSystemFilter] = useState("ทั้งหมด");
  const [sortTime, setSortTime] = useState("ล่าสุด");
  const [page, setPage] = useState(1);

  const typeOptions = [
    "ทั้งหมด",
    ...Array.from(new Set(items.map((i) => TYPE_LABEL[i.requestType] ?? i.requestType))),
  ];
  const systemOptions = [
    "ทั้งหมด",
    ...Array.from(new Set(items.map((i) => i.systemName ?? "—"))),
  ];

  const filtered = items
    .filter((item) => {
      const typeLabel = TYPE_LABEL[item.requestType] ?? item.requestType;
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.customerName.includes(search) ||
        (item.systemName ?? "").includes(search);
      const matchType = typeFilter === "ทั้งหมด" || typeLabel === typeFilter;
      const matchSystem =
        systemFilter === "ทั้งหมด" || (item.systemName ?? "—") === systemFilter;
      return matchSearch && matchType && matchSystem;
    })
    .sort((a, b) => {
      if (sortTime === "ล่าสุด") return 0;
      const da = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
      const db = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
      return da - db;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function getVisiblePages() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 1, totalPages - 3));
    return Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        กำลังโหลด...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 bg-[#F0F4FA] p-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900">งานของฉัน</h1>
        <p className="text-[14px] text-gray-500">งานที่ต้องมอบหมาย</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="ค้นหา..."
          className="h-9 w-56 rounded-lg border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
        />
        <button
          type="button"
          onClick={() => setPage(1)}
          className="h-9 rounded-lg bg-[#366DBD] px-5 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
        >
          ค้นหา
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
            {typeFilter === "ทั้งหมด" ? "ประเภททั้งหมด" : typeFilter}
            <ChevronDown size={14} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              {typeOptions.map((t) => (
                <DropdownMenuRadioItem key={t} value={t}>
                  {t === "ทั้งหมด" ? "ประเภททั้งหมด" : t}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
            {systemFilter === "ทั้งหมด" ? "ระบบทั้งหมด" : systemFilter}
            <ChevronDown size={14} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={systemFilter} onValueChange={(v) => { setSystemFilter(v); setPage(1); }}>
              {systemOptions.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {s === "ทั้งหมด" ? "ระบบทั้งหมด" : s}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
            เวลา
            <ChevronDown size={14} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={sortTime} onValueChange={(v) => { setSortTime(v); setPage(1); }}>
              <DropdownMenuRadioItem value="ล่าสุด">ล่าสุด</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ครบกำหนดก่อน">ครบกำหนดก่อน</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards */}
      <div className="overflow-hidden rounded-[14px] border border-[#7FA7E8] bg-white">
        {paged.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#7FA7E8]">
            {paged.map((item) => {
              const typeLabel = TYPE_LABEL[item.requestType] ?? item.requestType;
              return (
                <div key={item.requestId} className="bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[16px] font-bold text-gray-900">{item.title}</p>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[13px] text-gray-500">
                          ผู้ใช้งานภายในองค์กร : {item.customerName}
                        </p>
                        <p className="text-[13px] text-gray-500">
                          ระบบ : {item.systemName ?? "—"}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
                          {typeLabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <p className="text-[13px] text-gray-500">
                        ประเภท : <span className="font-semibold text-gray-800">{item.problemName}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push(`/operations/${item.ticketId}`)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50"
                      >
                        รายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-[13px] text-gray-500">
        <span>
          แสดง {filtered.length === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, filtered.length)} จาก {filtered.length} รายการ
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 items-center gap-1 rounded-md px-2 hover:text-[#366DBD] disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          {getVisiblePages().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-[13px] ${
                page === p ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]" : "border-transparent hover:border-[#7FA7E8]"
              }`}
            >
              {p}
            </button>
          ))}
          {totalPages > 3 && <span className="px-1 text-gray-400">...</span>}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-8 items-center gap-1 rounded-md px-2 hover:text-[#366DBD] disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
