"use client";

import { useState } from "react";
import type { Column } from "@/types/table";
import { AdminTablePage, StatusBadge } from "@/components/admin/admin-table-page";
import { customerRows } from "@/lib/admin-mocks";

type CustomerRow = (typeof customerRows)[number];

const initialRows: CustomerRow[] = customerRows.map((row) => ({ ...row }));

export default function CustomersPage() {
  const [rows, setRows] = useState(initialRows);

  const columns: Column<CustomerRow>[] = [
    { key: "date", title: "วันที/เวลา" },
    { key: "name", title: "ชื่อ-นามสกุล" },
    { key: "role", title: "บทบาท" },
    { key: "email", title: "อีเมล" },
    {
      key: "status",
      title: "สถานะ",
      render: (_, row, index) => (
        <div className="flex items-center justify-center gap-2">
          <StatusBadge
            label={String(row.status)}
            tone="danger"
            onClick={() => {
              setRows((current) =>
                current.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, status: "ปฏิเสธ" } : item,
                ),
              );
            }}
          />
          <StatusBadge
            label={String(row.action)}
            tone="success"
            onClick={() => {
              setRows((current) =>
                current.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, status: "ยอมรับ", action: "ยอมรับ" }
                    : item,
                ),
              );
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full rounded-xl p-4 sm:p-6 lg:p-8">
      <AdminTablePage
        title="จัดการข้อมูลลงทะเบียนผู้แจ้งประเด็น"
        subtitle="การจัดการให้การยืนยันสำหรับผู้ทำการลงทะเบียน"
        columns={columns}
        data={rows}
        searchPlaceholder=""
        showDelete={false}
        showCreate={false}
      />
    </div>
  );
}
