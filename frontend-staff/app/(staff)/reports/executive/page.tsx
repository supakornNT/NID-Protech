"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, ResponsiveContainer,
} from "recharts";
import { Ticket, CheckCircle2, Loader2, AlertTriangle, Clock, Upload, Star } from "lucide-react";
import { useExecutiveReport } from "@/hooks/use-executive-report";

function StatCard({ icon, value, label, valueColor }: { icon: React.ReactNode; value: string; label: string; valueColor: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="mb-1">{icon}</div>
      <p className={`text-3xl font-bold leading-none ${valueColor}`}>{value}</p>
      <p className="mt-1 text-[13px] text-gray-500">{label}</p>
    </div>
  );
}

export default function ReportExecutivePage() {
  const { data, loading, error } = useExecutiveReport();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        กำลังโหลด...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  const maxProblemCount = Math.max(...data.commonProblems.map((p) => p.count), 1);
  const maxRatingCount = Math.max(...data.ratings.map((r) => r.count), 1);
  const donutTotal = data.donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold text-gray-900">รายงานสรุปผล</h1>
          <p className="text-[16px] text-gray-500">สำหรับผู้บริหาร</p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg border border-[#366DBD] px-4 py-2 text-[14px] text-[#366DBD] hover:bg-blue-50">
          <Upload size={15} />
          Export PDF
        </button>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4">
        <StatCard icon={<Ticket size={28} className="text-[#366DBD]" />} value={String(data.stats.total)} label="ตั๋วทั้งหมด" valueColor="text-[#366DBD]" />
        <StatCard icon={<CheckCircle2 size={28} className="text-[#4CAF50]" />} value={String(data.stats.closed)} label="ปิดงานสำเร็จทั้งหมด" valueColor="text-[#4CAF50]" />
        <StatCard icon={<Loader2 size={28} className="text-[#FFC107]" />} value={String(data.stats.inProgress)} label="กำลังดำเนินการทั้งหมด" valueColor="text-[#FFC107]" />
        <StatCard icon={<AlertTriangle size={28} className="text-[#F44336]" />} value={String(data.stats.overdue)} label="เกินกำหนด" valueColor="text-[#F44336]" />
        <StatCard icon={<Clock size={28} className="text-[#366DBD]" />} value={data.stats.avgCloseTime} label="เวลาปิดงานโดยเฉลี่ย" valueColor="text-[#366DBD]" />
      </div>

      {/* Weekly bar + Donut */}
      <div className="flex gap-5">
        <div className="flex-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="mb-3 text-center text-[15px] font-semibold text-gray-800">จำนวนตั๋วรายสัปดาห์</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weeklyData} barCategoryGap="35%">
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="ปัญหา" fill="#F44336" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ร้องเรียน" fill="#FFC107" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-6 text-[13px]">
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[#F44336]" />ปัญหา</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[#FFC107]" />ร้องเรียน</span>
          </div>
        </div>

        <div className="flex-2 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="mb-2 text-center text-[15px] font-semibold text-gray-800">สัดส่วนสถานะทั้งหมด</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.donutData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} dataKey="value" startAngle={90} endAngle={-270}>
                {data.donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <text x="50%" y="46%" textAnchor="middle" fontSize={26} fontWeight="bold" fill="#111827">{donutTotal}</text>
              <text x="50%" y="56%" textAnchor="middle" fontSize={12} fill="#6B7280">ทั้งหมด</text>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 space-y-1.5 text-[13px]">
            {data.donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bar */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="mb-3 text-center text-[15px] font-semibold text-gray-800">จำนวนตั๋วรายปี</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.monthlyData} barCategoryGap="35%">
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#366DBD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="flex gap-5">
        {/* Common problems */}
        <div className="flex-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="mb-4 text-center text-[15px] font-semibold text-gray-800">ปัญหาที่พบบ่อย</p>
          <div className="space-y-3">
            {data.commonProblems.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="relative h-7 flex-1 overflow-hidden rounded bg-gray-100">
                  <div
                    className="flex h-full items-center px-2 rounded bg-[#366DBD]"
                    style={{ width: `${(p.count / maxProblemCount) * 100}%` }}
                  >
                    <span className="text-[13px] font-semibold text-white">{p.count}</span>
                  </div>
                </div>
                <span className="w-44 text-[13px] text-gray-700">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-2 flex-col gap-5">
          {/* Ticket stats */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="mb-3 text-center text-[15px] font-semibold text-gray-800">ปริมาณตั๋ว</p>
            <div className="space-y-2">
              {data.ticketStats.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-[14px]">
                  <span className="text-gray-700">{s.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">{s.prev}</span>
                    <span className="font-semibold text-gray-900">{s.curr}</span>
                    <span className={`w-10 font-semibold ${s.diff >= 0 ? "text-[#F44336]" : "text-[#4CAF50]"}`}>
                      {s.diff >= 0 ? `↑${s.diff}` : `↓${Math.abs(s.diff)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="mb-3 text-center text-[15px] font-semibold text-gray-800">คะแนนความพึงพอใจ</p>
            <div className="space-y-2">
              {data.ratings.map((r) => (
                <div key={r.star} className="flex items-center gap-2">
                  <span className="flex w-8 items-center gap-0.5 text-[13px] text-gray-600">
                    {r.star} <Star size={10} className="fill-gray-400 text-gray-400" />
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100" style={{ height: 10 }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(r.count / maxRatingCount) * 100}%`,
                        background: r.star >= 3 ? "#4CAF50" : "#F44336",
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-[13px] text-gray-600">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
