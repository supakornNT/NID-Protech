"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useTracking, type TrackingItem } from "@/hooks/use-tracking";

const LIMIT = 10;

const STATUS_STEPS = [
  "ยื่นเรื่อง",
  "ตรวจสอบ",
  "ดำเนินการแก้ไข",
  "รอประเมิน",
  "เสร็จสิ้น",
];

const STATUS_MAP: Record<string, { label: string; style: string }> = {
  assigned: {
    label: "รอดำเนินการ",
    style: "border-gray-300 bg-gray-50 text-gray-600",
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    style: "border-[#366DBD] bg-[#EEF4FF] text-[#366DBD]",
  },
  waiting_confirm: {
    label: "รอประเมิน",
    style: "border-[#E8A84C] bg-[#FFF8EC] text-[#C47F00]",
  },
  closed: {
    label: "เสร็จสิ้น",
    style: "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]",
  },
};

const STATUS_FILTER_OPTIONS = [
  "ทั้งหมด",
  "รอดำเนินการ",
  "กำลังดำเนินการ",
  "รอประเมิน",
  "เสร็จสิ้น",
];

function formatTimeLeft(dueAt: string | null, status: string): string {
  if (status === "closed") return "เสร็จสิ้นแล้ว";
  if (!dueAt) return "ยังไม่กำหนดเวลา";

  const diff = new Date(dueAt).getTime() - Date.now();
  if (diff <= 0) return "เกินกำหนดแล้ว";

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `เหลือเวลาอีก ${days} วัน ${hours} ชั่วโมง`;
}

const STATUS_TO_STEP: Record<string, number> = {
  screening: 0,
  assigned: 1,
  in_progress: 2,
  waiting_confirm: 3,
  closed: 4,
};

function StepperBar({
  steps,
  status,
}: {
  steps: TrackingItem["steps"];
  status: string;
}) {
  const allDone = status === "closed";
  const currentStepIndex = STATUS_TO_STEP[status] ?? -1;
  const isLast = (i: number) => i === STATUS_STEPS.length - 1;

  return (
    <div className="mt-3 flex items-start gap-0">
      {STATUS_STEPS.map((label, i) => {
        const done = isLast(i) ? status === "closed" : allDone || !!steps[i];
        const isCurrent = !allDone && i === currentStepIndex;

        const circleClass = isCurrent
          ? "border-[#60A5FA] bg-[#DBEAFE] text-[#2563EB]"
          : done
            ? "border-[#366DBD] bg-[#366DBD] text-white"
            : "border-gray-300 bg-white text-gray-300";

        const leftLineActive = i !== 0 && (done || isCurrent);
        const rightLineActive = !isLast(i) && done && !isCurrent;

        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={`h-1 flex-1 ${i === 0 ? "invisible" : leftLineActive ? "bg-[#366DBD]" : "bg-gray-200"}`}
              />
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-all ${circleClass}`}
              >
                {done && !isCurrent ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <span
                    className={`h-2 w-2 rounded-full ${isCurrent ? "bg-[#60A5FA]" : "bg-gray-300"}`}
                  />
                )}
              </div>
              <div
                className={`h-1 flex-1 ${isLast(i) ? "invisible" : rightLineActive ? "bg-[#366DBD]" : "bg-gray-200"}`}
              />
            </div>
            <div className="mt-1 flex flex-col items-center text-center">
              <span
                className={`text-[11px] font-semibold ${isCurrent ? "text-[#2563EB]" : done ? "text-[#366DBD]" : "text-gray-400"}`}
              >
                {label}
              </span>
              {steps[i] ? (
                <>
                  <span className="text-[10px] text-gray-400">
                    วันที่ {(steps[i] as { date: string; time: string }).date}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {(steps[i] as { date: string; time: string }).time}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-gray-300">ยังไม่เสร็จ</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackingStatusPage() {
  const router = useRouter();
  const { items, loading, error, submitWork } = useTracking();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const filtered = items.filter((item) => {
    const statusLabel = STATUS_MAP[item.status]?.label ?? item.status;
    const matchSearch =
      search === "" ||
      item.title.includes(search) ||
      item.customerName.includes(search) ||
      item.systemName.includes(search);
    const matchStatus =
      statusFilter === "ทั้งหมด" || statusLabel === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function getVisiblePages() {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
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
        <h1 className="text-[28px] font-bold text-gray-900">การจัดการงาน</h1>
        <p className="text-[14px] text-gray-500">ติดตามสถานะการดำเนินการ</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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
            {statusFilter === "ทั้งหมด" ? "สถานะทั้งหมด" : statusFilter}
            <ChevronDown size={14} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              {STATUS_FILTER_OPTIONS.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {s === "ทั้งหมด" ? "สถานะทั้งหมด" : s}
                </DropdownMenuRadioItem>
              ))}
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
              const mapped = STATUS_MAP[item.status];
              const statusLabel = mapped?.label ?? item.status;
              const statusStyle =
                mapped?.style ?? "border-gray-300 bg-gray-50 text-gray-600";
              const timeLeft = formatTimeLeft(item.dueAt, item.status);

              const canSubmit =
                !!item.allResolved &&
                item.status !== "waiting_confirm" &&
                item.status !== "closed";
              return (
                <div key={item.id} className="bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[16px] font-bold text-gray-900">
                        {item.title}
                      </p>
                      <span className="rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
                        {item.problemName}
                      </span>
                    </div>
                    <span className="shrink-0 text-[13px] text-gray-400">
                      {timeLeft}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="mt-1 flex flex-col gap-0.5">
                      <p className="text-[13px] text-gray-500">
                        ผู้ใช้งานภายในองค์กร : {item.customerName}
                      </p>
                      <p className="text-[13px] text-gray-500">
                        ระบบ : {item.systemName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!!item.wasRejected && (
                        <span className="rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
                          ถูกตีกลับ
                        </span>
                      )}
                      <span
                        className={`rounded-md border px-2.5 py-0.5 text-[12px] ${statusStyle}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-end gap-4">
                    <div className="flex-1">
                      <StepperBar steps={item.steps} status={item.status} />
                    </div>
                    <div className="flex flex-col al gap-8">
                      {canSubmit && (
                        <button
                          type="button"
                          onClick={() => submitWork(item.id)}
                          className="rounded-lg bg-[#366DBD] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#2d5da3]"
                        >
                          ส่งงาน
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-lg border border-gray-400 bg-white px-4 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50"
                        onClick={() =>
                          router.push(`/tracking/status/${item.id}`)
                        }
                      >
                        ดูรายละเอียด
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
          แสดง {filtered.length === 0 ? 0 : (page - 1) * LIMIT + 1}-
          {Math.min(page * LIMIT, filtered.length)} จาก {filtered.length} รายการ
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
                page === p
                  ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                  : "border-transparent hover:border-[#7FA7E8]"
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
