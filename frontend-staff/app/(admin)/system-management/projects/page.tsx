"use client";

import type { Column } from "@/types/table";
import {
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { projectManagementRows } from "@/lib/admin-mocks";

type ProjectManagementRow = (typeof projectManagementRows)[number];

const columns: Column<ProjectManagementRow>[] = [
  { key: "projectName", title: "ชื่อโครงการ" },
  { key: "organization", title: "องค์กร" },
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
  { key: "updatedAt", title: "อัปเดตล่าสุด" },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-full rounded-xl bg-[#ffffff] p-4 sm:p-6 lg:p-8">
      <AdminTablePage
        title="จัดการโครงการ"
        subtitle="จัดการข้อมูลโครงการและความสัมพันธ์กับองค์กร"
        columns={columns}
        data={projectManagementRows}
        searchPlaceholder="ค้นหาชื่อโครงการหรือองค์กร"
        showDelete={false}
        createLabel="สร้าง"
      />
    </div>
  );
}
