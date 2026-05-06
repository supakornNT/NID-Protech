// components/protech-table.tsx

"use client";

import * as React from "react";
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
  render?: (value: any, row: T, index: number) => React.ReactNode;
};

type ProTechTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyRows?: number;
};

export function ProTechTable<T>({
  columns,
  data,
  emptyRows = 5,
}: ProTechTableProps<T>) {
  const remainRows =
    data.length < emptyRows ? emptyRows - data.length : 0;

  return (
    <div className="overflow-hidden rounded-md border border-[#7FA7E8] bg-white shadow-sm">
      <Table>
        {/* HEADER */}
        <TableHeader className="bg-[#DCE9FF]">
          <TableRow className="border-[#7FA7E8] hover:bg-[#DCE9FF]">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`h-12 border-r border-[#7FA7E8] text-center text-[15px] font-normal text-[#3A6FCF] last:border-r-0 ${column.className || ""}`}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* BODY */}
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="border-[#7FA7E8] hover:bg-[#F5F9FF]"
            >
              {columns.map((column, colIndex) => {
                const value = row[column.key as keyof T];

                return (
                  <TableCell
                    key={colIndex}
                    className="h-14 border-r border-[#7FA7E8] text-center text-[15px] text-[#3A6FCF] last:border-r-0"
                  >
                    {column.render
                      ? column.render(value, row, rowIndex)
                      : String(value ?? "")}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}

          {/* EMPTY ROW */}
          {Array.from({ length: remainRows }).map((_, index) => (
            <TableRow
              key={`empty-${index}`}
              className="border-[#7FA7E8]"
            >
              {columns.map((_, colIndex) => (
                <TableCell
                  key={colIndex}
                  className="h-24 border-r border-[#7FA7E8] last:border-r-0"
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}