import type { ReactNode } from "react";

export type Column<T> = {
  key: keyof T | string;
  title: ReactNode;
  className?: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
};

export type ProTechTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  limit?: number;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};
