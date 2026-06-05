"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ToolbarSelect } from "@/components/ui/toolbar-select";
import { ProTechButton } from "@/components/tables/protech-button";
import { useMyWork } from "@/hooks/use-my-work";

const LIMIT = 4;
const ALL_OPTION = "ทั้งหมด";

const TYPE_LABEL: Record<string, string> = {
  issue: "ปัญหา",
  complaint: "ร้องเรียน",
  service: "บริการ",
};

export default function OperationsPage() {
  const router = useRouter();
  const { items, loading, error } = useMyWork(1);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL_OPTION);
  const [systemFilter, setSystemFilter] = useState(ALL_OPTION);
  const [sortTime, setSortTime] = useState<"latest" | "earliest">("latest");
  const [page, setPage] = useState(1);

  const typeOptions = [
    { value: ALL_OPTION, label: "ประเภททั้งหมด" },
    ...Array.from(
      new Set(items.map((item) => TYPE_LABEL[item.requestType] ?? item.requestType)),
    ).map((label) => ({
      value: label,
      label,
    })),
  ];

  const systemOptions = [
    { value: ALL_OPTION, label: "ระบบทั้งหมด" },
    ...Array.from(new Set(items.map((item) => item.systemName ?? "—"))).map(
      (label) => ({
        value: label,
        label,
      }),
    ),
  ];

  const timeOptions = [
    { value: "latest", label: "ล่าสุด" },
    { value: "earliest", label: "ครบกำหนดก่อน" },
  ];

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const typeLabel = TYPE_LABEL[item.requestType] ?? item.requestType;
      const matchSearch =
        search === "" ||
        item.title.includes(search) ||
        item.customerName.includes(search) ||
        (item.systemName ?? "").includes(search);
      const matchType = typeFilter === ALL_OPTION || typeLabel === typeFilter;
      const matchSystem =
        systemFilter === ALL_OPTION || (item.systemName ?? "—") === systemFilter;
      return matchSearch && matchType && matchSystem;
    });

    result.sort((a, b) => {
      const left = a.dueAt ? new Date(a.dueAt).getTime() : 0;
      const right = b.dueAt ? new Date(b.dueAt).getTime() : 0;
      return sortTime === "latest" ? right - left : left - right;
    });

    return result;
  }, [items, search, sortTime, systemFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function getVisiblePages() {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 3));
    return Array.from({ length: Math.min(3, totalPages) }, (_, index) => start + index);
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 bg-[#F0F4FA] p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900">งานของฉัน</h1>
        <p className="text-[14px] text-gray-500">งานที่ต้องมอบหมาย</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหา..."
              className="h-9 w-full sm:w-56 rounded-lg border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
            />
          </div>
          <ProTechButton
            variant="search"
            className="h-9 shrink-0 px-5 text-[14px]"
            onClick={() => setPage(1)}
          >
            ค้นหา
          </ProTechButton>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <ToolbarSelect
            value={typeFilter}
            options={typeOptions}
            placeholder="ประเภททั้งหมด"
            onChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
            className="flex-1 min-w-[120px] sm:flex-none sm:w-[190px]"
          />

          <ToolbarSelect
            value={systemFilter}
            options={systemOptions}
            placeholder="ระบบทั้งหมด"
            onChange={(value) => {
              setSystemFilter(value);
              setPage(1);
            }}
            className="flex-1 min-w-[120px] sm:flex-none sm:w-[190px]"
          />

          <ToolbarSelect
            value={sortTime}
            options={timeOptions}
            placeholder="เวลา"
            onChange={(value) => {
              setSortTime(value as "latest" | "earliest");
              setPage(1);
            }}
            className="w-full sm:w-[170px]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[#7FA7E8] bg-white">
        {loading && paged.length === 0 ? (
          <div className="animate-pulse divide-y divide-[#7FA7E8]">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="w-2/3 space-y-2">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="h-8 w-24 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#7FA7E8] ">
            {paged.map((item) => {
              const typeLabel = TYPE_LABEL[item.requestType] ?? item.requestType;

              return (
                <div key={item.id} className="bg-white p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
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

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                      <p className="text-[13px] text-gray-500">
                        ประเภท :{" "}
                        <span className="font-semibold text-gray-800">
                          {item.problemName}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push(`/operations/${item.id}`)}
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

      <div className="flex items-center justify-between text-[13px] text-gray-500">
        <span>
          แสดง {filtered.length === 0 ? 0 : (page - 1) * LIMIT + 1}–
          {Math.min(page * LIMIT, filtered.length)} จาก {filtered.length} รายการ
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="flex h-8 items-center gap-1 rounded-md px-2 hover:text-[#366DBD] disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          {getVisiblePages().map((visiblePage) => (
            <button
              key={visiblePage}
              onClick={() => setPage(visiblePage)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-[13px] ${
                page === visiblePage
                  ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                  : "border-transparent hover:border-[#7FA7E8]"
              }`}
            >
              {visiblePage}
            </button>
          ))}
          {totalPages > 3 && <span className="px-1 text-gray-400">...</span>}
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
