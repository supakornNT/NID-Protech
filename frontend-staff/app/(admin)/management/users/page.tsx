"use client";

import type { Column } from "@/types/table";
import {
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { userRows } from "@/lib/admin-mocks";

type UserRow = (typeof userRows)[number];

const columns: Column<UserRow>[] = [
  { key: "order", title: "ลำดับ" },
  { key: "name", title: "ชื่อ-นามสกุล" },
  { key: "role", title: "บทบาท" },
  { key: "email", title: "อีเมล" },
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

export default function UsersPage() {
  return (
    <div className="min-h-full rounded-xl  p-4 sm:p-6 lg:p-8">
      <AdminTablePage
        title="จัดการข้อมูลผู้ใช้งาน"
        subtitle="จัดการข้อมูลผู้ใช้งานในระบบและสิทธิ์การเข้าถึง"
        columns={columns}
        data={userRows}
        searchPlaceholder="ค้นหาชื่อผู้ใช้งานหรืออีเมล"
        showDelete={false}
        createLabel="สร้าง"
      />
    </div>
  );
}
