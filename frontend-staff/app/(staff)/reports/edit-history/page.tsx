"use client";

import { useEffect, useState } from "react";
import type { Column } from "@/types/table";
import { AdminTablePage } from "@/components/admin/admin-table-page";
import { MessageCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLoadingDelay } from "@/hooks/use-loading-delay";

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
  รอดำเนินการ: "border-gray-300 bg-gray-50 text-gray-600",
  การดำเนินการ: "border-[#366DBD] bg-[#EEF4FF] text-[#366DBD]",
  เสร็จสิ้น: "border-[#4CAF7D] bg-[#EDFAF3] text-[#1A7A4A]",
  ยกเลิก: "border-[#FF6B81] bg-[#FFF0F2] text-[#FF5D76]",
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: "all",
    type: "all",
  });
  const [serverStatusOptions, setServerStatusOptions] = useState<string[]>([]);
  const [serverTypeOptions, setServerTypeOptions] = useState<string[]>([]);

  const showSkeleton = useLoadingDelay(loading, 200);

  useEffect(() => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", "10");
    if (search) {
      params.append("search", search);
    }
    if (selectedFilters.status && selectedFilters.status !== "all") {
      params.append("status", selectedFilters.status);
    }
    if (selectedFilters.type && selectedFilters.type !== "all") {
      params.append("type", selectedFilters.type);
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/reports/edit-history?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          if (d.stats) {
            setStats(d.stats);
          }
          setRows(d.rows && Array.isArray(d.rows) ? d.rows : []);
          if (d.pagination) {
            setTotalPages(d.pagination.totalPages ?? 1);
            setTotalItems(d.pagination.total ?? 0);
          }
          if (d.filterOptions) {
            setServerStatusOptions(d.filterOptions.statuses ?? []);
            setServerTypeOptions(d.filterOptions.types ?? []);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, selectedFilters]);

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
    <div className="flex flex-1 flex-col gap-6 bg-white p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-[32px] font-bold text-gray-900">การจัดการงาน</h1>
        <p className="text-[16px] text-gray-500">ประวัติการแก้ไข</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageCircle size={36} className="text-[#366DBD]" strokeWidth={1.5} />}
          value={String(stats?.total ?? 0)}
          label="ตั๋วงานทั้งหมด"
          valueColor="text-[#366DBD]"
        />
        <StatCard
          icon={<CheckCircle2 size={36} className="text-[#366DBD]" strokeWidth={1.5} />}
          value={String(stats?.inProgress ?? 0)}
          label="กำลังดำเนินการ"
          valueColor="text-[#366DBD]"
        />
        <StatCard
          icon={<CheckCircle2 size={36} className="text-[#4CAF50]" strokeWidth={1.5} />}
          value={String(stats?.done ?? 0)}
          label="เสร็จสิ้น"
          valueColor="text-[#4CAF50]"
          bg="bg-[#F0FAF1]"
        />
        <StatCard
          icon={<AlertTriangle size={36} className="text-[#F44336]" strokeWidth={1.5} />}
          value={String(stats?.overdue ?? 0)}
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
        loading={showSkeleton}
        searchValue={search}
        onSearchClick={(val) => {
          setSearch(val);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        filterValues={{
          status: selectedFilters.status ?? "all",
          type: selectedFilters.type ?? "all",
        }}
        onFilterChange={(newFilters) => {
          setSelectedFilters(newFilters);
          setPage(1);
        }}
        disableClientFiltering
        disableClientPagination
        filters={[
          {
            key: "status",
            placeholder: "สถานะทั้งหมด",
            options: serverStatusOptions.length > 0
              ? serverStatusOptions
              : ["รอดำเนินการ", "การดำเนินการ", "เสร็จสิ้น", "ยกเลิก"],
          },
          {
            key: "type",
            placeholder: "ประเภททั้งหมด",
            options: serverTypeOptions,
          },
        ]}
      />
    </div>
  );
}
