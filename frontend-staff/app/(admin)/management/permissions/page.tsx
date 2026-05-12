"use client";

import type { Column } from "@/types/table";
import {
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { permissionManagementRows } from "@/lib/admin-mocks";

type PermissionManagementRow = (typeof permissionManagementRows)[number];

const columns: Column<PermissionManagementRow>[] = [
  { key: "permissionName", title: "ชื่อสิทธิ์" },
  { key: "module", title: "Module" },
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

export default function PermissionsPage() {
  return (
    <div className="min-h-full rounded-xl  p-4 sm:p-6 lg:p-8">
      <AdminTablePage
        title="จัดการสิทธิ์"
        subtitle="จัดการข้อมูลสิทธิ์การเข้าถึงของผู้ใช้งานในระบบ"
        columns={columns}
        data={permissionManagementRows}
        searchPlaceholder="ค้นหาชื่อสิทธิ์หรือโมดูล"
        showDelete={false}
        createLabel="เพิ่มสิทธิ์"
      />
    </div>
  );
}
