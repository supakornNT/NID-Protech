"use client";

import * as React from "react";
import Link from "next/link";

import {
  Info,
  Search,
} from "lucide-react";

import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  RequestListItem,
  useRequestList,
} from "@/hooks/use-report-list";

import { Column } from "@/types/table";
import { ProTechTable } from "@/components/tables/protech-table";
import TicketPdfButton from "@/components/pdf/TicketPdfButton";

const columns: Column<RequestListItem>[] =
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
      key: "problem",
      title: "ปัญหา/ข้อร้องเรียน",
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
    render: (_, row) => (
      <div className="flex justify-center text-[#3A6FCF]">
        <TicketPdfButton
          ticket={{ trackingNo: row.trackingNo }}
          trackingPath={`/track/${row.trackingNo}`}
          fileName={`${row.trackingNo}.pdf`}
          buttonLabel="Download PDF"
          iconOnly
        />
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
  const [search, setSearch] =
    React.useState("");

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
    reports: requests,
    pagination,
    loading,
    error,
    setPage,
    applySearch,
  } = useRequestList();

  return (
    <div className="mx-auto h-full w-full min-w-0 max-w-[90rem] px-4 pt-6 sm:px-6 lg:px-10">
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
          onClick={() =>
            applySearch(search)
          }
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
          data={requests}
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
