"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { Ticket, CheckCircle2, Loader2, AlertTriangle, ClipboardList } from "lucide-react";
import { useOperationsReport, type KanbanCard } from "@/hooks/use-operations-report";

const TYPE_LABEL: Record<string, string> = {
  issue: "ปัญหา",
  complaint: "ร้องเรียน",
  service: "บริการ",
};

function StatCard({ icon, value, label, valueColor }: { icon: React.ReactNode; value: string; label: string; valueColor: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="mb-1">{icon}</div>
      <p className={`text-3xl font-bold leading-none ${valueColor}`}>{value}</p>
      <p className="mt-1 text-[13px] text-gray-500">{label}</p>
    </div>
  );
}

function TicketCard({ card }: { card: KanbanCard }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-semibold text-gray-900 line-clamp-1">{card.title}</p>
        <span className="shrink-0 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2 py-0.5 text-[12px] text-[#D9534F]">
          {TYPE_LABEL[card.requestType] ?? card.requestType}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[12px] text-gray-400">{card.customerName}</p>
        <p className="text-[12px] text-gray-500">{card.remaining}</p>
      </div>
    </div>
  );
}

export default function ReportOperationsPage() {
  const { data, loading, error } = useOperationsReport();



  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-semibold text-gray-900">รายงานสรุปผล</h1>
        <p className="text-[16px] text-gray-500">การปฏิบัติการ</p>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-6 w-full">
          {/* Stat cards skeleton */}
          <div className="rounded-2xl bg-[#EEF3FB] p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="h-6 w-6 rounded bg-gray-200" />
                  <div className="h-8 w-12 rounded bg-gray-200" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Ticket columns skeleton */}
          <div className="rounded-2xl bg-[#EEF3FB] p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-2xl border border-[#D6E4F7] bg-white p-4">
                  <div className="h-5 w-24 rounded bg-gray-200" />
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-28 rounded bg-gray-200" />
                        <div className="h-4 w-12 rounded bg-gray-200" />
                      </div>
                      <div className="h-3 w-16 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error || !data ? (
        <div className="flex flex-1 items-center justify-center text-red-400 bg-white border border-gray-200 rounded-2xl p-8 min-h-[300px]">
          โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </div>
      ) : (
        <>
      <div className="rounded-2xl bg-[#EEF3FB] p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={<Ticket size={28} className="text-[#366DBD]" />} value={String(data.stats.todayTotal)} label="ตั๋วทั้งหมด(วันนี้)" valueColor="text-[#366DBD]" />
          <StatCard icon={<CheckCircle2 size={28} className="text-[#4CAF50]" />} value={String(data.stats.todayClosed)} label="ปิดงาน(วันนี้)" valueColor="text-[#4CAF50]" />
          <StatCard icon={<Loader2 size={28} className="text-[#FFC107]" />} value={String(data.stats.inProgress)} label="กำลังดำเนินการ" valueColor="text-[#FFC107]" />
          <StatCard icon={<AlertTriangle size={28} className="text-[#F44336]" />} value={String(data.stats.overdue)} label="เกินกำหนด" valueColor="text-[#F44336]" />
          <StatCard icon={<ClipboardList size={28} className="text-[#366DBD]" />} value={String(data.stats.screening)} label="กำลังรอคัดกรอง" valueColor="text-[#366DBD]" />
        </div>
      </div>

      {/* Ticket columns */}
      <div className="rounded-2xl bg-[#EEF3FB] p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3 rounded-2xl border border-[#D6E4F7] bg-white p-4">
              <p className="text-[15px] font-semibold text-gray-800">{col.title}</p>
              {col.cards.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-gray-400">ไม่มีรายการ</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {col.cards.map((card) => (
                    <TicketCard key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="mb-4 text-center text-[15px] font-semibold text-gray-800">สัปดาห์ที่ผ่านมา</p>
        <div className="mb-3 flex justify-end gap-5 text-[13px]">
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[#E05252]" />ปัญหา</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[#F5C518]" />ร้องเรียน</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.weeklyData} barCategoryGap="30%" barGap={4}>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="ปัญหา" fill="#E05252" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="ปัญหา" position="top" style={{ fontSize: 11, fill: "#555" }} />
            </Bar>
            <Bar dataKey="ร้องเรียน" fill="#F5C518" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="ร้องเรียน" position="top" style={{ fontSize: 11, fill: "#555" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
        </>
      )}
    </div>
  );
}
