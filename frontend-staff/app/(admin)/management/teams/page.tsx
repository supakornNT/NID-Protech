"use client";

import type { Column } from "@/types/table";
import {
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { teamManagementRows } from "@/lib/admin-mocks";

type TeamManagementRow = (typeof teamManagementRows)[number];

const columns: Column<TeamManagementRow>[] = [
  { key: "teamName", title: "ชื่อทีม" },
  { key: "leader", title: "หัวหน้าทีม" },
  { key: "membersCount", title: "จำนวนสมาชิก" },
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

export default function TeamsPage() {
  return (
    <div className="min-h-full rounded-xl bg-[#E9EEF5] p-4 sm:p-6 lg:p-8">
      <AdminTablePage
        title="จัดการทีม"
        subtitle="จัดการทีมปฏิบัติงานและการมอบหมายผู้รับผิดชอบ"
        columns={columns}
        data={teamManagementRows}
        searchPlaceholder="ค้นหาชื่อทีมหรือหัวหน้าทีม"
        showDelete={false}
        createLabel="เพิ่มทีม"
      />
    </div>
  );
}
