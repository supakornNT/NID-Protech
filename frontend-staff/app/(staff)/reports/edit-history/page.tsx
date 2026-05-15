"use client";

import type { Column } from "@/types/table";
import { AdminTablePage } from "@/components/admin/admin-table-page";
import { MessageCircle, CheckCircle2, AlertTriangle } from "lucide-react";

type HistoryRow = {
  system: string;
  title: string;
  type: string;
  status: string;
  time: string;
  operator: string;
};

const statuses = ["การดำเนินการ", "รอประเมิน", "เสร็จสิ้น", "เกินกำหนด"];

const mockData: HistoryRow[] = Array.from({ length: 50 }, (_, i) => ({
  system: i % 2 === 0 ? "นักเรียน" : "คุณครู",
  title: "ไม่สามารถเข้าสู่ระบบได้",
  type: "เข้าสู่ระบบ",
  status: statuses[i % 4],
  time: "17:25",
  operator: "ธนวัฒน์ แซ่จึง",
}));

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    การดำเนินการ: "border-[#366DBD] text-[#366DBD]",
    รอประเมิน: "border-[#D9A800] text-[#D9A800]",
    เสร็จสิ้น: "border-[#4CAF50] text-[#4CAF50]",
    เกินกำหนด: "border-[#F44336] text-[#F44336]",
  };
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-0.5 text-[13px] ${styles[status] ?? "border-gray-300 text-gray-500"}`}>
      {status}
    </span>
  );
}

function StatCard({
  icon,
  value,
  label,
  valueColor,
  bg = "bg-white",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  valueColor: string;
  bg?: string;
}) {
  return (
    <div className={`flex flex-1 flex-col gap-1 rounded-2xl border border-[#E5E7EB] ${bg} p-5 shadow-sm`}>
      <div className="mb-1">{icon}</div>
      <p className={`text-4xl font-bold leading-none ${valueColor}`}>{value}</p>
      <p className={`mt-1 text-[14px] font-semibold ${valueColor}`}>{label}</p>
    </div>
  );
}

export default function ReportEditHistoryPage() {
  const columns: Column<HistoryRow>[] = [
    { key: "system", title: "ระบบ" },
    { key: "title", title: "หัวข้อเรื่อง" },
    { key: "type", title: "ประเภท" },
    {
      key: "status",
      title: "การดำเนินการ",
      render: (value) => <StatusBadge status={String(value)} />,
    },
    { key: "time", title: "เวลา" },
    { key: "operator", title: "ผู้ดำเนินการ" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-bold text-gray-900">การจัดการงาน</h1>
        <p className="text-[16px] text-gray-500">ประวัติการแก้ไข</p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4">
        <StatCard
          icon={<MessageCircle size={36} className="text-[#366DBD]" strokeWidth={1.5} />}
          value="36"
          label="ตั๋วงานทั้งหมด"
          valueColor="text-[#366DBD]"
        />
        <StatCard
          icon={<CheckCircle2 size={36} className="text-[#366DBD]" strokeWidth={1.5} />}
          value="12"
          label="กำลังดำเนินการ"
          valueColor="text-[#366DBD]"
        />
        <StatCard
          icon={<CheckCircle2 size={36} className="text-[#4CAF50]" strokeWidth={1.5} />}
          value="24"
          label="เสร็จสิ้น"
          valueColor="text-[#4CAF50]"
          bg="bg-[#F0FAF1]"
        />
        <StatCard
          icon={<AlertTriangle size={36} className="text-[#F44336]" strokeWidth={1.5} />}
          value="4"
          label="เกินกำหนด"
          valueColor="text-[#F44336]"
          bg="bg-[#FFF5F5]"
        />
      </div>

      {/* Table */}
      <AdminTablePage
        title=""
        subtitle=""
        columns={columns}
        data={mockData}
        showCreate={false}
        showDelete={false}
        filters={[
          { key: "status", placeholder: "สถานะทั้งหมด", options: statuses },
          { key: "type", placeholder: "ประเภททั้งหมด", options: ["เข้าสู่ระบบ", "ข้อมูล", "การชำระเงิน"] },
        ]}
      />
    </div>
  );
}
