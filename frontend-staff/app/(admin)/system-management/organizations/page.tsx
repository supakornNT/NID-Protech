"use client";

import type { Column } from "@/types/table";
import {
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { organizationManagementRows } from "@/lib/admin-mocks";

type OrganizationManagementRow = (typeof organizationManagementRows)[number];

const columns: Column<OrganizationManagementRow>[] = [
  { key: "organizationName", title: "ชื่อองค์กร" },
  { key: "type", title: "ประเภท" },
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

export default function OrganizationsPage() {
  return (
    <div className="min-h-full rounded-xl bg-[#ffffff] p-4 sm:p-6 lg:p-8">
      <AdminTablePage
        title="จัดการองค์กร"
        subtitle="จัดการข้อมูลองค์กรที่ใช้งานในระบบสนับสนุน"
        columns={columns}
        data={organizationManagementRows}
        searchPlaceholder="ค้นหาชื่อองค์กร"
        showDelete={false}
        createLabel="เพิ่มองค์กร"
      />
    </div>
  );
}
