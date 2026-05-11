"use client";
import type { Column } from "@/types/table";
import {
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { customerRows } from "@/lib/admin-mocks";

type CustomerRow = (typeof customerRows)[number];

const columns: Column<CustomerRow>[] = [
  { key: "date", title: "วันที่/เวลา" },
  { key: "name", title: "ชื่อ-นามสกุล" },
  { key: "role", title: "บทบาท" },
  { key: "email", title: "อีเมล" },
  {
    key: "status",
    title: "สถานะ",
    render: (value, row) => (
      <div className="flex items-center justify-center gap-2">
        <StatusBadge label={String(value)} tone="danger" />

        <StatusBadge
          label={String(row.action)}
          tone="success"
        />
      </div>
    ),
  },
];

export default function CustomersPage() {
  return (
    <div className="px-35 py-4">
      <AdminTablePage
        title="จัดการข้อมูลลงทะเบียนผู้แจ้งประเด็น"
        subtitle="การจัดการให้การยืนยันสำหรับผู้ทำการลงทะเบียน"
        columns={columns}
        data={customerRows}
        searchPlaceholder=""
        showDelete={false}
        showCreate={false}
      />
    </div>
  );
}
