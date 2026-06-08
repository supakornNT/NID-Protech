"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Info, Search } from "lucide-react";

import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { RequestListItem, useRequestList } from "@/hooks/use-request-list";
import { useLoadingDelay } from "@/hooks/use-loading-delay";
import { Column } from "@/types/table";

const columns: Column<RequestListItem>[] = [
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
    className: "min-w-[160px]",
  },
  {
    key: "document",
    title: "ดูเอกสาร",
    className: "min-w-[140px]",
    render: (_, row) => {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const canViewDocument = [
        "รอดำเนินการ",
        "กำลังดำเนินการ",
        "รอตรวจสอบโดยลูกค้า",
        "เสร็จสิ้น",
      ].includes(row.status);
      return (
        <div className="flex justify-center text-[#3A6FCF]">
          {canViewDocument ? (
            <a
              href={`${API_BASE_URL}/requests/${row.id}/pdf`}
              target="_blank"
              rel="noreferrer"
            >
              <FileText size={18} />
            </a>
          ) : (
            <FileText size={18} className="cursor-not-allowed text-gray-300" />
          )}
        </div>
      );
    },
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
  const [search, setSearch] = React.useState("");

  const {
    requests: requests,
    pagination,
    loading,
    error,
    setPage,
    applySearch,
  } = useRequestList();

  const [hasFetched, setHasFetched] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setHasFetched(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const showSkeleton = useLoadingDelay(loading, 200);

  if (!hasFetched && loading) {
    if (!showSkeleton) {
      return null;
    }
    return (
      <div className="mx-auto h-full w-full min-w-0 max-w-[90rem] px-4 pt-6 sm:px-6 lg:px-10 animate-pulse">
        {/* Title Skeleton */}
        <div className="mb-6 h-10 w-72 rounded bg-gray-200" />

        {/* Search Bar Skeleton */}
        <div className="mb-5 flex min-w-0 items-center gap-3">
          <div className="h-10 flex-1 rounded-md bg-gray-200" />
          <div className="h-10 w-24 rounded-md bg-gray-200 shrink-0" />
        </div>

        {/* Table Skeleton */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="h-12 border-b bg-gray-150 px-4" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex h-16 items-center border-b border-gray-100 px-4 gap-4"
            >
              <div className="h-4 w-1/4 rounded bg-gray-200" />
              <div className="h-4 w-1/6 rounded bg-gray-200" />
              <div className="h-4 w-1/4 rounded bg-gray-200" />
              <div className="h-4 w-12 rounded bg-gray-200 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto h-full w-full min-w-0 max-w-[90rem] px-4 pt-6 sm:px-6 lg:px-10">
      <h1 className="mb-4 text-2xl font-medium text-[#3A6FCF] sm:text-4xl">
        ค้นหาหมายเลขการติดตาม
      </h1>

      <div className="mb-5 flex min-w-0 items-center gap-3">
        <ProTechSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={22} />}
        />

        <ProTechButton className="shrink-0" onClick={() => applySearch(search)}>
          ค้นหา
        </ProTechButton>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="w-full">
        <ProTechTable
          columns={columns}
          data={requests}
          limit={pagination.limit}
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={setPage}
          loading={loading}
        />

        <div className="mt-4 flex justify-end" />
      </div>
    </div>
  );
}
