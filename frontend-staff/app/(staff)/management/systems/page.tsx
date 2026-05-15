"use client";

import type { Column } from "@/types/table";
import {
  ActionIcons,
  CheckCell,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";

type ProjectRow = {
  order: number;
  organization: string;
  projectName: string;
  type: string;
  status: "ใช้งาน" | "ไม่ใช้งาน" | "พัฒนา";
};

const projectRows: ProjectRow[] = Array.from({ length: 10 }, (_, index) => ({
  order: index + 1,
  organization: "บริษัท โปรเทค ซัพพอร์ต จำกัด",
  projectName: "ProTech Support",
  type: "web app",
  status:
    index === 1 || index === 4 || index === 6 || index === 7 || index === 8
      ? "ไม่ใช้งาน"
      : index === 5
        ? "พัฒนา"
        : "ใช้งาน",
}));

const columns: Column<ProjectRow>[] = [
  { key: "check", title: "", render: () => <CheckCell /> },
  { key: "order", title: "ลำดับ" },
  { key: "organization", title: "ชื่อองค์กร" },
  { key: "projectName", title: "ชื่อโครงการ" },
  { key: "type", title: "ประเภท" },
  {
    key: "status",
    title: "สถานะ",
    render: (value) => (
      <StatusBadge
        label={String(value)}
        tone={value === "ใช้งาน" ? "success" : value === "พัฒนา" ? "neutral" : "danger"}
      />
    ),
  },
  {
    key: "actions",
    title: "จัดการ",
    render: () => <ActionIcons showInfo={false} />,
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          จัดการข้อมูลโครงการ
        </h1>
        <p className="mt-2 text-[16px] text-[#8B95A7]">จัดการข้อมูลโครงการที่เกี่ยวข้อง</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ProTechSearch
            value=""
            onChange={() => {}}
            placeholder=""
            className="w-[222px] flex-none"
            inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
          />
          <ProTechButton variant="primary" className="h-[31px] min-w-[74px] px-4 text-[14px]">
            ค้นหา
          </ProTechButton>
          <ToolbarSelect placeholder="สถานะทั้งหมด" />
          <ToolbarSelect placeholder="ประเภททั้งหมด" />
        </div>
        <ProTechButton variant="delete" className="h-[31px] px-4 text-[14px]">
          ลบ
        </ProTechButton>
      </div>

      <ProTechTable
        columns={columns}
        data={projectRows}
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
