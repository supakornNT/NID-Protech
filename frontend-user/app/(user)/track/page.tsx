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

interface ReportListItem
  extends TrackingRow {
  document: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ReportListResponse {
  items: ReportListItem[];
  pagination: PaginationMeta;
}

function buildApiUrl(
  path: string,
): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

async function fetchJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(
    buildApiUrl(path),
    {
      signal,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

function buildReportsPath(
  page: number,
  limit: number,
  search: string,
): string {
  const searchParams =
    new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

  if (search.trim().length > 0) {
    searchParams.set(
      "search",
      search.trim(),
    );
  }

  return `/user/reports?${searchParams.toString()}`;
}

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

const DEFAULT_PAGINATION: PaginationMeta =
  {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

export default function Page() {
  const [search, setSearch] =
    React.useState("");
  const [appliedSearch, setAppliedSearch] =
    React.useState("");
  const [reports, setReports] =
    React.useState<ReportListItem[]>([]);
  const [page, setPage] =
    React.useState(1);
  const [limit, setLimit] =
    React.useState(10);
  const [pagination, setPagination] =
    React.useState<PaginationMeta>(
      DEFAULT_PAGINATION,
    );
  const [loading, setLoading] =
    React.useState(true);
  const [error, setError] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setLimit(5);
        setPage(1);
      } else {
        setLimit(10);
        setPage(1);
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

  React.useEffect(() => {
    const controller =
      new AbortController();

    async function loadReports() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await fetchJson<ReportListResponse>(
            buildReportsPath(
              page,
              limit,
              appliedSearch,
            ),
            controller.signal,
          );

        setReports(data.items);
        setPagination(data.pagination);
      } catch (loadError) {
        if (
          loadError instanceof Error &&
          loadError.name ===
            "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load reports",
        );
        setReports([]);
        setPagination(
          DEFAULT_PAGINATION,
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReports();

    return () =>
      controller.abort();
  }, [appliedSearch, limit, page]);

  function handleSearch() {
    setPage(1);
    setAppliedSearch(search);
  }

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
          onClick={handleSearch}
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
