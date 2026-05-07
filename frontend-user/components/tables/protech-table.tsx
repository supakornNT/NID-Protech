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

type Column<T> = {
  key: keyof T | string;
  title: string;
  className?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
};

type ProTechTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  limit?: number;
};

export function ProTechTable<T>({
  columns,
  data,
  limit = 10,
}: ProTechTableProps<T>) {
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / limit));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="min-w-0 w-full max-w-full space-y-3">
      <div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-[#7FA7E8] bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[760px]">
          <TableHeader className="bg-[#DCE9FF]">
            <TableRow className="border-[#7FA7E8] hover:bg-[#DCE9FF]">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`h-12 border-r border-[#7FA7E8] px-4 text-center text-sm font-normal text-[#3A6FCF] last:border-r-0 ${
                    column.className || ""
                  }`}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-[#7FA7E8] hover:bg-[#F5F9FF]"
                >
                  {columns.map((column, colIndex) => {
                    const value = row[column.key as keyof T];

                    return (
                      <TableCell
                        key={colIndex}
                        className="h-12 border-r border-[#7FA7E8] px-4 py-3 text-center text-sm text-[#3A6FCF] last:border-r-0"
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

      <div className="flex w-full flex-wrap items-center justify-between gap-2 px-1 text-sm text-gray-600">
        <div className="text-xs sm:text-sm">
          แสดง {data.length === 0 ? 0 : startIndex + 1}-
          {Math.min(endIndex, data.length)} จาก {data.length} รายการ
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex h-9 items-center gap-1 rounded-md px-1 text-sm text-gray-500 transition hover:text-[#3A6FCF] disabled:cursor-not-allowed disabled:opacity-40 sm:px-2"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const current = index + 1;

            return (
              <button
                key={current}
                onClick={() => setPage(current)}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm transition ${
                  currentPage === current
                    ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                    : "border-transparent text-gray-600 hover:border-[#7FA7E8] hover:text-[#3A6FCF]"
                }`}
              >
                {current}
              </button>
            );
          })}

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 items-center gap-1 rounded-md px-1 text-sm text-gray-500 transition hover:text-[#3A6FCF] disabled:cursor-not-allowed disabled:opacity-40 sm:px-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
