"use client";

import type { Column } from "@/types/table";
import {
  ActionIcons,
  AdminTablePage,
  CheckCell,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { userGroupRows } from "@/lib/admin-mocks";

type UserGroupRow = (typeof userGroupRows)[number];

const columns: Column<UserGroupRow>[] = [
  { key: "check", title: "", render: () => <CheckCell /> },
  { key: "order", title: "ลำดับ" },
  { key: "groupName", title: "กลุ่มผู้ใช้งาน" },
  { key: "memberCount", title: "จำนวนสมาชิก" },
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
  {
    key: "actions",
    title: "จัดการ",
    render: () => <ActionIcons showInfo={false} />,
  },
];

export default function UserGroupsPage() {
  return (
    <AdminTablePage
      title="จัดการกลุ่มผู้ใช้งาน"
      subtitle="การจัดการกลุ่มผู้ใช้งานในระบบ"
      columns={columns}
      data={userGroupRows}
      searchPlaceholder=""
      filters={[
        {
          key: "status",
          placeholder: "สถานะทั้งหมด",
          options: ["ใช้งาน", "ไม่ใช้งาน"],
        },
      ]}
    />
  );
}
