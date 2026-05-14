import type { Column } from "@/types/table";
import { AdminTablePage } from "@/components/admin/admin-table-page";
import { loginLogRows } from "@/lib/admin-mocks";

type LoginLogRow = (typeof loginLogRows)[number];

const columns: Column<LoginLogRow>[] = [
  { key: "date", title: "วันที่/เวลา" },
  { key: "user", title: "ผู้ใช้" },
  { key: "system", title: "ระบบ" },
  { key: "status", title: "สถานะ" },
];

export default function ReportLoginHistoryPage() {
  return (
    <div className="flex flex-1 flex-col bg-white p-8">
      <AdminTablePage
        title="ประวัติการเข้าใช้งาน"
        subtitle="การตรวจสอบประวัติการเข้าใช้งาน"
        columns={columns}
        data={loginLogRows}
        searchPlaceholder=""
        showDelete={false}
        createLabel=""
      />
    </div>
  );
}
