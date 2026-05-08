"use client";

import Link from "next/link";

import {
  FileText,
  Info,
  Search,
} from "lucide-react";

import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  ReportListItem,
  useReportList,
} from "@/hooks/use-report-list";

import { Column } from "@/types/table";
import { ProTechTable } from "@/components/tables/protech-table";

const columns: Column<ReportListItem>[] =
  [
    {
      key: "trackingNo",
      title: "หมายเลขการติดตาม",
      className: "min-w-[220px]",
    },
    {
      key: "system",
      title: "ระบบ",
      className: "min-w-[120px]",
    },
    {
      key: "dueDate",
      title: "ระยะเวลากำหนดการแก้ไข",
      className: "min-w-[240px]",
    },
    {
      key: "document",
      title: "ออกเอกสาร",
      className: "min-w-[140px]",
      render: () => (
        <div className="flex justify-center">
          <FileText size={18} />
        </div>
      ),
    },
    {
      key: "detail",
      title: "รายละเอียด",
      className: "min-w-[140px]",
      render: (_, row) => (
        <div className="flex justify-center">
          <Link
            href={`/track/${row.trackingNo}`}
          >
            <Info
              size={18}
              className="cursor-pointer text-[#3A6FCF] hover:opacity-70"
            />
          </Link>
        </div>
      ),
    },
    {
      key: "status",
      title: "สถานะ",
      className: "min-w-[160px]",
    },
  ];

export default function Page() {
  // Flow หน้านี้:
  // 1. mount หน้าแล้ว useReportList() จะเรียก GET /user/reports?page=&limit=&search=
  // 2. API คืนรายการ report พร้อม pagination สำหรับหน้า table
  // 3. ตารางใช้ fields หลักคือ trackingNo, system, dueDate, document, status
  //    โดย field หลักมาจาก:
  //    - trackingNo <- reports.report_no
  //    - system <- systems.name (join ด้วย reports.system_id)
  //    - dueDate <- reports.resolve_due_at
  //    - status <- reports.status แล้ว backend map เป็น label ไทย
  //    - document <- ค่าที่ frontend ประกอบเพื่อใช้แสดงในตาราง
  // 4. กดค้นหา -> applySearch() -> ยิง API ใหม่พร้อม search
  //    search ตอนนี้ค้นจาก:
  //    - reports.report_no
  //    - reports.title
  //    - systems.name
  // 5. เปลี่ยนหน้า -> setPage() -> ยิง API ใหม่ตาม page/limit
  const {
    search,
    setSearch,
    reports,
    pagination,
    loading,
    error,
    setPage,
    applySearch,
  } = useReportList();

  return (
    <div className="mx-auto h-full w-full min-w-0 max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      <h1 className="mb-4 text-2xl font-medium text-[#3A6FCF] sm:text-4xl">
        ค้นหาหมายเลขการติดตาม
      </h1>

      <div className="mb-5 flex min-w-0 items-center gap-3">
        <ProTechSearch
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value,
            )
          }
          icon={<Search size={22} />}
        />

        <ProTechButton
          className=" shrink-0 "
          onClick={applySearch}
        >
          ค้นหา
        </ProTechButton>
      </div>

      {loading ? (
        <p className="mb-4 text-sm text-[#3A6FCF]">
          กำลังโหลดข้อมูล...
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="w-full">
        {/* กดรายละเอียดของแต่ละแถวจะไปหน้า /track/:trackingNo
            เพื่อเรียก detail API ของ report รายการนั้น */}
        <ProTechTable
          columns={columns}
          data={reports}
          limit={pagination.limit}
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={setPage}
        />

        <div className="mt-4 flex justify-end">
          {/* pagination component */}
        </div>
      </div>
    </div>
  );
}
