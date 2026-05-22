"use client";

import type { Column } from "@/types/table";
import {
  ActionIcons,
  CheckCell,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import {  ProTechSearchBar } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { useState } from "react";

type ProjectRow = {
  order: number;
  organization: string;
  systemName: string;
  type: string;
  status: "ใช้งาน" | "ไม่ใช้งาน" ;
  createdAt: string;

};


const columns: Column<ProjectRow>[] = [
  { key: "check", title: "", render: () => <CheckCell /> },
  { key: "order", title: "ลำดับ" },
  { key: "organization", title: "ชื่อองค์กร" },
  { key: "systemName", title: "ชื่อโครงการ" },
  { key: "type", title: "ประเภท" },
  {
    key: "status",
    title: "สถานะ",
    render: (value) => (
      <StatusBadge
        label={String(value)}
        tone={
          value === "ใช้งาน"
            ? "success"
            : value === "พัฒนา"
              ? "neutral"
              : "danger"
        }
      />
    ),
  },
  {
    key: "actions",
    title: "จัดการ",
    render: () => <ActionIcons showInfo={false} />,
  },
];
function mapCustomerRow(item: CustomerListApiItem): CustomerTableRow {
  return {
   
  };
}
// eturn {
//     items,
//     pagination,
//     loading,
//     error,
//     clearError,
//     activeId,
//     saving,
//     statusOptions: STATUS_OPTIONS,
//     fetchSystems,
//     createSystem,
//     updateSystem,
//     removeSystem,
export default function ProjectsPage() {
 const [items,] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
// const rows = useMemo(() => items.map(mapCustomerRow), [items]);
  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
        <div>
          <h1 className="text-[32px] font-bold leading-none text-[#111827]">
            จัดการข้อมูลโครงการ
          </h1>
          <p className="mt-2 text-[16px] text-[#8B95A7]">
            จัดการข้อมูลโครงการที่เกี่ยวข้อง
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <ProTechSearchBar
              value=""
              onValueChange={() => {}}
              onSearch={() => {}}
              placeholder=""
              className="gap-3"
              inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
              buttonClassName="h-[31px] min-w-[74px] px-4 text-[14px]"
            />
            <ToolbarSelect placeholder="สถานะทั้งหมด" />
            <ToolbarSelect placeholder="ประเภททั้งหมด" />
          </div>
          <ProTechButton variant="delete" className="h-[31px] px-4 text-[14px]">
            ลบ
          </ProTechButton>
        </div>

        <ProTechTable
          columns={columns}
          data={[]}
          page={2}
          totalPages={3}
          totalItems={50}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
}

function ToolbarSelect({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex h-[31px] min-w-[132px] items-center justify-between rounded-md border border-[#A8B1C2] bg-white px-4 text-[14px] text-[#6B7280]">
      <span>{placeholder}</span>
      <span>⌄</span>
    </div>
  );
}
