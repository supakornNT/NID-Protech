"use client";

import * as React from "react";
import { FileText, Info, Search } from "lucide-react";

import { ProTechTable } from "@/components/tables/protech-table";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechButton } from "@/components/tables/protech-button";

const columns = [
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
    render: () => (
      <div className="flex justify-center">
        <Info size={18} />
      </div>
    ),
  },
  {
    key: "status",
    title: "สถานะ",
    className: "min-w-[160px]",
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
  {
    trackingNo: "TH144-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH155-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH166-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH177-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH144-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH155-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH166-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH177-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH144-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH155-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH166-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH177-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
];

export default function Page() {
  const [search, setSearch] = React.useState("");

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="mx-auto h-full w-full min-w-0 max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      <h1 className="mb-4 text-3xl font-medium text-[#3A6FCF] sm:text-4xl">
        ค้นหาหมายเลขการติดตาม
      </h1>

      <div className="mb-5 flex min-w-0 items-center gap-3">
        <ProTechSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={22} />}
        />

        <ProTechButton className="shrink-0">ค้นหา</ProTechButton>
      </div>

      <ProTechTable columns={columns} data={filteredData} limit={10} />
    </div>
  );
}
