// app/page.tsx
"use client";
import { FileText, Info } from "lucide-react";
import { ProTechTable } from "@/components/tables/protech-table";

const columns = [
  {
    key: "trackingNo",
    title: "หมายเลขการติดตาม",
  },
  {
    key: "system",
    title: "ระบบ",
  },
  {
    key: "dueDate",
    title: "ระยะเวลากำหนดการแก้ไข",
  },
  {
    key: "document",
    title: "ออกเอกสาร",
    render: () => (
      <div className="flex justify-center">
        <FileText size={18} />
      </div>
    ),
  },
  {
    key: "detail",
    title: "รายละเอียด",
    render: () => (
      <div className="flex justify-center">
        <Info size={18} />
      </div>
    ),
  },
  {
    key: "status",
    title: "สถานะ",
  },
];

const data = [
  {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
];

export default function Page() {
  return (
    <div className="p-10">
      <div className="max-w-5xl">
        <h1 className="mb-6 text-3xl text-[#3A6FCF]">
          ค้นหาหมายเลขการติดตาม
        </h1>

        <ProTechTable
          columns={columns}
          data={data}
          emptyRows={4}
        />
      </div>
    </div>
  );
}