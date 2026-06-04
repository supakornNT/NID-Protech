"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { useCloseWork } from "@/hooks/use-close-work";

const LIMIT = 4;

export default function CloseWorkListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "history" ? "history" : "pending";

  const { requests, loading, error, fetchRequests } = useCloseWork();
  const [tab, setTab] = useState<"pending" | "history">(initialTab);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRequests(tab);
  }, [tab, fetchRequests]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return requests;

    return requests.filter((item) =>
      [
        item.requestNo,
        item.title,
        item.customerName,
        item.systemName ?? "",
        item.problemName,
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [requests, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function getVisiblePages() {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const start = Math.max(1, Math.min(page - 1, totalPages - 4));
    return Array.from({ length: Math.min(3, totalPages) }, (_, index) => start + index);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-8">
      <div>
        <h1 className="text-[32px] font-bold text-gray-900">พิจารณาปิดงาน</h1>
        <p className="text-[16px] text-gray-500">
          {tab === "pending"
            ? "คำขอที่รอตรวจสอบผลการแก้ไขก่อนปิดงาน"
            : "ประวัติคำขอที่ผ่านขั้นตอนพิจารณาปิดงานแล้ว"}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setTab("pending");
            setPage(1);
          }}
          className={`rounded-full px-5 py-2 text-[14px] font-semibold transition ${
            tab === "pending"
              ? "bg-[#2F66C5] text-white"
              : "border border-[#A8B1C2] bg-white text-[#4B5563] hover:bg-[#EEF4FF]"
          }`}
        >
          รออนุมัติ
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("history");
            setPage(1);
          }}
          className={`rounded-full px-5 py-2 text-[14px] font-semibold transition ${
            tab === "history"
              ? "bg-[#2F66C5] text-white"
              : "border border-[#A8B1C2] bg-white text-[#4B5563] hover:bg-[#EEF4FF]"
          }`}
        >
          ประวัติการอนุมัติ
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาคำขอ..."
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
        {loading && paged.length === 0 ? (
          <div className="flex animate-pulse flex-col divide-y divide-[#7FA7E8]">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-4 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="w-2/3 space-y-2">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                  </div>
                  <div className="shrink-0 space-y-3">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="h-8 w-24 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center text-sm text-red-500">
            โหลดข้อมูลไม่สำเร็จ
          </div>
        ) : paged.length === 0 ? (
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
                  </div>
                  <p className="text-[14px] text-gray-500">เลขคำขอ : {item.requestNo}</p>
                  <p className="text-[14px] text-gray-500">ผู้แจ้ง : {item.customerName}</p>
                  <p className="text-[14px] text-gray-500">ระบบ : {item.systemName || "-"}</p>
                  <span className="mt-1 inline-flex w-fit rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[13px] text-[#D9534F]">
                    {item.problemName}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[14px]">
                    สถานะ : <span className="font-bold text-[#366DBD]">{item.status}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/consideration/close-work/${item.id}?tab=${tab}`)
                    }
                    className="mt-1 rounded-lg border border-[#929396] bg-white px-5 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50"
                  >
                    {tab === "pending" ? "จัดการ" : "ดูรายละเอียด"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="flex h-9 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        {getVisiblePages().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-all ${
              page === pageNumber
                ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                : "border-transparent text-gray-600 hover:border-[#7FA7E8] hover:text-[#3A6FCF]"
            }`}
          >
            {pageNumber}
          </button>
        ))}
        {totalPages > 3 && <span className="px-1 text-gray-400">...</span>}
        <button
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page === totalPages}
          className="flex h-9 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
