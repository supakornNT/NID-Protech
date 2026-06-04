"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProTechTableProps } from "@/types/table";

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - maxVisiblePages + 1),
  );

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}

export function ProTechTable<T>({
  columns,
  data,
  limit = 10,
  page,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
}: ProTechTableProps<T>) {
  const [internalPage, setInternalPage] = React.useState(1);
  const [showSpinner, setShowSpinner] = React.useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowSpinner(true);
      }, 250);
    } else {
      setShowSpinner(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  const isControlled =
    typeof page === "number" &&
    typeof totalPages === "number" &&
    typeof totalItems === "number" &&
    typeof onPageChange === "function";

  const derivedTotalPages = Math.max(1, Math.ceil(data.length / limit));

  const currentPage = isControlled
    ? Math.min(page, Math.max(1, totalPages))
    : Math.min(internalPage, derivedTotalPages);

  const resolvedTotalPages = isControlled ? Math.max(1, totalPages) : derivedTotalPages;
  const resolvedTotalItems = isControlled ? totalItems : data.length;

  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  const currentData = isControlled ? data : data.slice(startIndex, endIndex);
  const visiblePages = getVisiblePages(currentPage, resolvedTotalPages);

  function handlePageChange(nextPage: number) {
    const safePage = Math.max(1, Math.min(nextPage, resolvedTotalPages));

    if (isControlled) {
      onPageChange(safePage);
      return;
    }

    setInternalPage(safePage);
  }

  return (
    <div className="min-w-0 w-full max-w-full space-y-4">
      <div className="relative min-w-0 w-full max-w-full overflow-hidden rounded-[14px] border border-[#7FA7E8] bg-white transition-all duration-200">
        {showSpinner && currentData.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[0.5px]">
            <div className="flex items-center justify-center rounded-full bg-white p-3 shadow-lg border border-blue-100">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3A6FCF] border-t-transparent" />
            </div>
          </div>
        )}
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-[#DCE9FF]">
              <TableRow className="border-[#7FA7E8] hover:bg-[#DCE9FF]">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`h-15 px-4 text-center text-sm font-normal tracking-normal normal-case text-black ${
                      column.className || ""
                    }`}
                  >
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && currentData.length === 0 ? (
                Array.from({ length: limit }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-[#7FA7E8]">
                    {columns.map((_, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className="h-12 border-r border-[#7FA7E8] px-3 py-3 last:border-r-0"
                      >
                        <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : currentData.length > 0 ? (
                currentData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="border-[#7FA7E8] transition-all duration-200 hover:bg-[#FCFDFF]"
                  >
                    {columns.map((column, colIndex) => {
                      const value = row[column.key as keyof T];

                      return (
                        <TableCell
                          key={colIndex}
                          className="h-12 border-r border-[#7FA7E8] px-3 py-3 text-center text-sm text-black last:border-r-0"
                        >
                          {column.render
                            ? column.render(value, row, startIndex + rowIndex)
                            : String(value ?? "")}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-sm text-gray-500"
                  >
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-2 px-1 pt-3 text-sm text-gray-600">
        <div className="text-xs sm:text-sm">
          แสดง {resolvedTotalItems === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + currentData.length, resolvedTotalItems)} จาก{" "}
          {resolvedTotalItems} รายการ
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-9 items-center gap-1 rounded-md px-1 text-sm text-gray-500 transition-all duration-200 hover:text-[#3A6FCF] disabled:cursor-not-allowed disabled:opacity-40 sm:px-2"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {visiblePages.map((visiblePage) => (
            <button
              key={visiblePage}
              onClick={() => handlePageChange(visiblePage)}
              className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-all duration-200 ${
                currentPage === visiblePage
                  ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                  : "border-transparent text-gray-600 hover:border-[#7FA7E8] hover:text-[#3A6FCF]"
              }`}
            >
              {visiblePage}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === resolvedTotalPages}
            className="flex h-9 items-center gap-1 rounded-md px-1 text-sm text-gray-500 transition-all duration-200 hover:text-[#3A6FCF] disabled:cursor-not-allowed disabled:opacity-40 sm:px-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
