"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { Ticket, CheckCircle2, Loader2, AlertTriangle, ClipboardList } from "lucide-react";

const weeklyData = [
  { day: "จันทร์", ปัญหา: 36, ร้องเรียน: 22 },
  { day: "อังคาร", ปัญหา: 26, ร้องเรียน: 18 },
  { day: "พุธ", ปัญหา: 20, ร้องเรียน: 20 },
  { day: "พฤหัสบดี", ปัญหา: 5, ร้องเรียน: 18 },
  { day: "ศุกร์", ปัญหา: 5, ร้องเรียน: 18 },
  { day: "เสาร์", ปัญหา: 9, ร้องเรียน: 23 },
  { day: "อาทิตย์", ปัญหา: 9, ร้องเรียน: 23 },
];

const ticketCard = {
  system: "ระบบชำระเงินค้าง",
  reporter: "สมชาย ตอนเจดีย์",
  remaining: "คงเหลือ 2 วัน",
  type: "ปัญหา",
};

const columns = [
  { title: "ตั๋วเข้าใหม่", cards: [ticketCard, ticketCard, ticketCard] },
  { title: "กำลังคัดกรอง", cards: [ticketCard, ticketCard, ticketCard] },
  { title: "รอมอบหมายงาน", cards: [ticketCard, ticketCard, ticketCard] },
];

function StatCard({ icon, value, label, valueColor }: { icon: React.ReactNode; value: string; label: string; valueColor: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="mb-1">{icon}</div>
      <p className={`text-3xl font-bold leading-none ${valueColor}`}>{value}</p>
      <p className="mt-1 text-[13px] text-gray-500">{label}</p>
    </div>
  );
}

function TicketCard({ card }: { card: typeof ticketCard }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-semibold text-gray-900">{card.system}</p>
        <span className="shrink-0 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2 py-0.5 text-[12px] text-[#D9534F]">
          {card.type}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[12px] text-gray-400">{card.reporter}</p>
        <p className="text-[12px] text-gray-500">{card.remaining}</p>
      </div>
    </div>
  );
}

export default function ReportOperationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-semibold text-gray-900">รายงานสรุปผล</h1>
        <p className="text-[16px] text-gray-500">การปฏิบัติการ</p>
      </div>

      {/* Stat cards */}
      <div className="rounded-2xl bg-[#EEF3FB] p-5">
        <div className="flex gap-4">
          <StatCard icon={<Ticket size={28} className="text-[#366DBD]" />} value="12" label="ตั๋วทั้งหมด(วันนี้)" valueColor="text-[#366DBD]" />
          <StatCard icon={<CheckCircle2 size={28} className="text-[#4CAF50]" />} value="4" label="ปิดงาน(วันนี้)" valueColor="text-[#4CAF50]" />
          <StatCard icon={<Loader2 size={28} className="text-[#FFC107]" />} value="32" label="กำลังดำเนินการ" valueColor="text-[#FFC107]" />
          <StatCard icon={<AlertTriangle size={28} className="text-[#F44336]" />} value="12" label="เกินกำหนด(วันนี้)" valueColor="text-[#F44336]" />
          <StatCard icon={<ClipboardList size={28} className="text-[#366DBD]" />} value="14" label="กำลังรอคัดกรอง" valueColor="text-[#366DBD]" />
        </div>
      </div>

      {/* Ticket columns */}
      <div className="rounded-2xl bg-[#EEF3FB] p-5">
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3 rounded-2xl border border-[#D6E4F7] bg-white p-4">
              <p className="text-[15px] font-semibold text-gray-800">{col.title}</p>
              <div className="flex flex-col gap-3">
                {col.cards.map((card, i) => (
                  <TicketCard key={i} card={card} />
                ))}
              </div>
              {/* Pagination dots */}
              <div className="mt-1 flex justify-center gap-2">
                {[1, 2].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[12px] ${
                      p === 1 ? "border-[#366DBD] text-[#366DBD]" : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
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
          <BarChart data={weeklyData} barCategoryGap="30%" barGap={4}>
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
    </div>
  );
}
