"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const LIMIT = 10;

const STATUS_STEPS = ["ยื่นเรื่อง", "ตรวจสอบ", "ดำเนินการแก้ไข", "เสร็จสิ้น"];

type StepInfo = { date: string; time: string } | null;

interface TrackingItem {
  id: number;
  title: string;
  problemType: string;
  status: "กำลังดำเนินการ" | "รอประเมิน" | "เสร็จสิ้น" | "รอดำเนินการ";
  customerName: string;
  systemName: string;
  timeLeft: string;
  steps: [StepInfo, StepInfo, StepInfo, StepInfo];
  note: string;
}

const MOCK_ITEMS: TrackingItem[] = [
  {
    id: 1,
    title: "ไม่สามารถเพิ่มรายชื่อนักเรียนได้",
    problemType: "ปัญหา",
    status: "กำลังดำเนินการ",
    customerName: "นายสมชาย ดอนเจดีย์",
    systemName: "นักเรียน",
    timeLeft: "เหลือเวลาอีก 2 วัน 7 ชั่วโมง",
    steps: [
      { date: "31/1", time: "06:31" },
      { date: "31/1", time: "10:46" },
      null,
      null,
    ],
    note: "Dev กำลังเช็ค API และกำลังแก้ไขคาดว่ามีปัญหาที่เส้น post",
  },
  {
    id: 2,
    title: "ไม่สามารถเพิ่มรายชื่อนักเรียนได้",
    problemType: "ปัญหา",
    status: "รอประเมิน",
    customerName: "นายสมชาย ดอนเจดีย์",
    systemName: "นักเรียน",
    timeLeft: "เหลือเวลาอีก 2 วัน 7 ชั่วโมง",
    steps: [
      { date: "31/1", time: "06:31" },
      { date: "31/1", time: "10:46" },
      { date: "31/1", time: "10:46" },
      null,
    ],
    note: "Dev กำลังเช็ค API และกำลังแก้ไขคาดว่ามีปัญหาที่เส้น post",
  },
  {
    id: 3,
    title: "ระบบล็อกอินไม่ได้",
    problemType: "ปัญหา",
    status: "เสร็จสิ้น",
    customerName: "นางสาวสมหญิง ใจดี",
    systemName: "ครู",
    timeLeft: "เสร็จสิ้นแล้ว",
    steps: [
      { date: "28/1", time: "09:00" },
      { date: "28/1", time: "11:30" },
      { date: "29/1", time: "14:00" },
      { date: "30/1", time: "16:00" },
    ],
    note: "แก้ไขเรียบร้อยแล้ว ปัญหาเกิดจาก session หมดอายุ",
  },
];

const STATUS_STYLES: Record<TrackingItem["status"], string> = {
  "กำลังดำเนินการ": "border-[#366DBD] bg-[#EEF4FF] text-[#366DBD]",
  "รอประเมิน": "border-[#E8A84C] bg-[#FFF8EC] text-[#C47F00]",
  "เสร็จสิ้น": "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]",
  "รอดำเนินการ": "border-gray-300 bg-gray-50 text-gray-600",
};

function getStepCount(steps: TrackingItem["steps"]) {
  return steps.filter(Boolean).length;
}

function StepperBar({ steps }: { steps: TrackingItem["steps"] }) {
  const completed = getStepCount(steps);
  return (
    <div className="mt-3 flex items-start gap-0">
      {STATUS_STEPS.map((label, i) => {
        const done = i < completed;
        const current = i === completed - 1 && completed < 4;
        const last = i === 3 && completed === 4;
        const isLast = i === STATUS_STEPS.length - 1;
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Left line */}
              <div className={`h-0.75 flex-1 ${i === 0 ? "invisible" : done ? "bg-[#366DBD]" : "bg-gray-200"}`} />
              {/* Circle */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-all
                  ${last || (done && !current)
                    ? "border-[#366DBD] bg-[#366DBD] text-white"
                    : current
                    ? "border-[#366DBD] bg-[#366DBD] text-white"
                    : done
                    ? "border-[#366DBD] bg-[#366DBD] text-white"
                    : "border-gray-300 bg-white text-gray-300"
                  }`}
              >
                {done || last ? <Check size={13} strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-gray-300" />}
              </div>
              {/* Right line */}
              <div className={`h-0.75 flex-1 ${isLast ? "invisible" : done && i + 1 < completed ? "bg-[#366DBD]" : "bg-gray-200"}`} />
            </div>
            <div className="mt-1 flex flex-col items-center text-center">
              <span className={`text-[11px] font-semibold ${done ? "text-[#366DBD]" : "text-gray-400"}`}>{label}</span>
              {steps[i] ? (
                <>
                  <span className="text-[10px] text-gray-400">วันที่ {steps[i]!.date}</span>
                  <span className="text-[10px] text-gray-400">{steps[i]!.time}</span>
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const statusOptions = ["ทั้งหมด", "กำลังดำเนินการ", "รอประเมิน", "เสร็จสิ้น", "รอดำเนินการ"];

  const filtered = MOCK_ITEMS.filter((item) => {
    const matchSearch =
      search === "" ||
      item.title.includes(search) ||
      item.customerName.includes(search) ||
      item.systemName.includes(search);
    const matchStatus = statusFilter === "ทั้งหมด" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function getVisiblePages() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 1, totalPages - 3));
    return Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i);
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

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
            {statusFilter === "ทั้งหมด" ? "สถานะทั้งหมด" : statusFilter}
            <ChevronDown size={14} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              {statusOptions.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {s === "ทั้งหมด" ? "สถานะทั้งหมด" : s}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
            ระบบทั้งหมด <ChevronDown size={14} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="ทั้งหมด">
              <DropdownMenuRadioItem value="ทั้งหมด">ระบบทั้งหมด</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
            เวลา <ChevronDown size={14} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="ทั้งหมด">
              <DropdownMenuRadioItem value="ทั้งหมด">ทั้งหมด</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="today">วันนี้</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="week">สัปดาห์นี้</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="month">เดือนนี้</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {paged.map((item) => (
          <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            {/* Card top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[16px] font-bold text-gray-900">{item.title}</p>
                <span className="rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
                  {item.problemType}
                </span>
                <span className={`rounded-md border px-2.5 py-0.5 text-[12px] ${STATUS_STYLES[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <span className="shrink-0 text-[13px] text-gray-400">{item.timeLeft}</span>
            </div>

            {/* Info */}
            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-[13px] text-gray-500">ผู้ใช้งานภายในองค์กร : {item.customerName}</p>
              <p className="text-[13px] text-gray-500">ระบบ : {item.systemName}</p>
            </div>

            {/* Stepper + detail button */}
            <div className="mt-3 flex items-end gap-4">
              <div className="flex-1">
                <StepperBar steps={item.steps} />
              </div>
              <button
                type="button"
                className="mb-1 shrink-0 rounded-lg border border-gray-400 bg-white px-4 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                ดูรายละเอียด
              </button>
            </div>

            {/* Note */}
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
              {item.note}
            </div>
          </div>
        ))}

        {paged.length === 0 && (
          <div className="flex items-center justify-center py-16 text-gray-400">ไม่พบรายการ</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-[13px] text-gray-500">
        <span>แสดง {Math.min((page - 1) * LIMIT + 1, filtered.length)}-{Math.min(page * LIMIT, filtered.length)} จาก {filtered.length} รายการ</span>
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
