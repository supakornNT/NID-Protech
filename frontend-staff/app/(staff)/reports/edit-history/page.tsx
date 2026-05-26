"use client";

import { useEffect, useState } from "react";
import type { Column } from "@/types/table";
import { AdminTablePage } from "@/components/admin/admin-table-page";
import { MessageCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type HistoryRow = {
  id: number;
  system: string;
  title: string;
  type: string;
  status: string;
  time: string;
  operator: string;
};

type Stats = {
  total: number;
  inProgress: number;
  done: number;
  overdue: number;
};

const STATUS_STYLES: Record<string, string> = {
  การดำเนินการ: "border-[#366DBD] text-[#366DBD]",
  รอประเมิน: "border-[#D9A800] text-[#D9A800]",
  เสร็จสิ้น: "border-[#4CAF50] text-[#4CAF50]",
  ยกเลิก: "border-gray-400 text-gray-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-0.5 text-[13px] ${STATUS_STYLES[status] ?? "border-gray-300 text-gray-500"}`}>
      {status}
    </span>
  );
}

function StatCard({ icon, value, label, valueColor, bg = "bg-white" }: {
  icon: React.ReactNode; value: string; label: string; valueColor: string; bg?: string;
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
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, done: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reports/edit-history`)
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setRows(Array.isArray(d.rows) ? d.rows : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const statusOptions = ["การดำเนินการ", "รอประเมิน", "เสร็จสิ้น", "ยกเลิก"];
  const typeOptions = [...new Set(rows.map((r) => r.type).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 bg-white p-8">
      <div>
        <h1 className="text-[32px] font-bold text-gray-900">การจัดการงาน</h1>
        <p className="text-[16px] text-gray-500">ประวัติการแก้ไข</p>
      </div>

      <div className="flex gap-4">
        <StatCard
          icon={<MessageCircle size={36} className="text-[#366DBD]" strokeWidth={1.5} />}
          value={String(stats.total)}
          label="ตั๋วงานทั้งหมด"
          valueColor="text-[#366DBD]"
        />
        <StatCard
          icon={<CheckCircle2 size={36} className="text-[#366DBD]" strokeWidth={1.5} />}
          value={String(stats.inProgress)}
          label="กำลังดำเนินการ"
          valueColor="text-[#366DBD]"
        />
        <StatCard
          icon={<CheckCircle2 size={36} className="text-[#4CAF50]" strokeWidth={1.5} />}
          value={String(stats.done)}
          label="เสร็จสิ้น"
          valueColor="text-[#4CAF50]"
          bg="bg-[#F0FAF1]"
        />
        <StatCard
          icon={<AlertTriangle size={36} className="text-[#F44336]" strokeWidth={1.5} />}
          value={String(stats.overdue)}
          label="เกินกำหนด"
          valueColor="text-[#F44336]"
          bg="bg-[#FFF5F5]"
        />
      </div>

      <AdminTablePage
        title=""
        subtitle=""
        columns={columns}
        data={rows}
        showCreate={false}
        showDelete={false}
        filters={[
          { key: "status", placeholder: "สถานะทั้งหมด", options: statusOptions },
          { key: "type", placeholder: "ประเภททั้งหมด", options: typeOptions },
        ]}
      />
    </div>
  );
}
