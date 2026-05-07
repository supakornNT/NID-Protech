"use client";

import * as React from "react";
import Link from "next/link";

import {
  FileText,
  Info,
  Search,
} from "lucide-react";

import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechButton } from "@/components/tables/protech-button";

import { Column } from "@/types/table";
import { ProTechTable } from "@/components/tables/protech-table";
import { TrackingRow } from "@/types/tracking";
import { data } from "@/app/mock";

const columns: Column<TrackingRow>[] = [
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
        <Link href={`/track/${row.trackingNo}`}>
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

  const [limit, setLimit] =
    React.useState(10);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setLimit(5);
      } else {
        setLimit(10);
      }
    }

    handleResize();

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize,
      );
  }, []);

  const filteredData = data.filter(
    (item) =>
      Object.values(item).some((value) =>
        String(value)
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
      ),
  );

  return (
    <div className="mx-auto h-full w-full min-w-0 max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* TITLE */}
      <h1 className="mb-4 text-2xl font-medium text-[#3A6FCF] sm:text-4xl">
        ค้นหาหมายเลขการติดตาม
      </h1>

      {/* SEARCH */}
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

        <ProTechButton className=" shrink-0 ">
          ค้นหา
        </ProTechButton>
      </div>

      {/* TABLE */}
      <div className="w-full">
        <ProTechTable
          columns={columns}
          data={filteredData}
          limit={limit}
        />

        {/* PAGINATION */}
        <div className="mt-4 flex justify-end">
          {/* pagination component */}
        </div>
      </div>
    </div>
  );
}