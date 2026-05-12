"use client";

import type { Column } from "@/types/table";
import {
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { problemTypeManagementRows } from "@/lib/admin-mocks";

type ProblemTypeManagementRow = (typeof problemTypeManagementRows)[number];

const columns: Column<ProblemTypeManagementRow>[] = [
  { key: "problemTypeName", title: "ชื่อประเภทประเด็น" },
  { key: "reportType", title: "ประเภทรายงาน" },
  {
    key: "status",
    title: "สถานะ",
    render: (value) => (
      <StatusBadge
        label={String(value)}
        tone={value === "ใช้งาน" ? "success" : "danger"}
      />
    ),
  },
];

export default function ProblemTypesPage() {
  return (
    <div className="min-h-full rounded-xl bg-[#E9EEF5] p-4 sm:p-6 lg:p-8">
      <AdminTablePage
        title="จัดการประเภทประเด็น"
        subtitle="จัดการประเภทประเด็นและคำร้องที่ใช้ในระบบ"
        columns={columns}
        data={problemTypeManagementRows}
        searchPlaceholder="ค้นหาชื่อประเภทประเด็น"
        showDelete={false}
        createLabel="เพิ่มประเภทประเด็น"
      />
    </div>
  );
}
