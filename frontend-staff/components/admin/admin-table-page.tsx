"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Edit3, Info, Plus, Trash2 } from "lucide-react";

import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import type { Column } from "@/types/table";

type FilterConfig = {
  key: string;
  placeholder: string;
  options: string[];
};
type StatusBadgeProps = {
  label: string;
  tone?: "success" | "danger" | "neutral";
  onclick?: () => void;
};
type AdminTablePageProps<T extends Record<string, unknown>> = {
  title: string;
  subtitle: string;
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  createLabel?: string;
  deleteLabel?: string;
  showCreate?: boolean;
  showDelete?: boolean;
};

export function AdminTablePage<T extends Record<string, unknown>>({
  title,
  subtitle,
  columns,
  data,
  searchPlaceholder = "",
  filters = [],
  createLabel = "สร้าง",
  deleteLabel = "ลบ",
  showCreate = true,
  showDelete = true,
}: AdminTablePageProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >(Object.fromEntries(filters.map((filter) => [filter.key, "all"])));

  const filteredData = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return data.filter((row) => {
      const matchesSearch =
        searchValue.length === 0 ||
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchValue),
        );

      const matchesFilters = filters.every((filter) => {
        const selected = selectedFilters[filter.key];

        if (!selected || selected === "all") {
          return true;
        }

        return String(row[filter.key] ?? "") === selected;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, filters, search, selectedFilters]);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const safePage = Math.min(page, totalPages);
  const pagedData = filteredData.slice(
    (safePage - 1) * limit,
    safePage * limit,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          {title}
        </h1>
        <p className="mt-3 text-[16px] text-[#8B95A7]">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <ProTechSearch
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-[222px] flex-none"
            inputClassName="h-10 rounded-md border border-[#A8B1C2] px-3 text-[16px]"
          />

          <ProTechButton variant="primary" className="h-10 px-6 text-[16px]">
            ค้นหา
          </ProTechButton>

          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <select
                value={selectedFilters[filter.key] ?? "all"}
                onChange={(event) => {
                  setSelectedFilters((current) => ({
                    ...current,
                    [filter.key]: event.target.value,
                  }));
                  setPage(1);
                }}
                className="h-10 min-w-[132px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-[16px] text-[#6B7280] outline-none"
              >
                <option value="all">{filter.placeholder}</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B95A7]" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          {showDelete && (
            <ProTechButton
              variant="delete"
              className="h-10 px-4 text-[16px]"
              icon={<Trash2 size={18} />}
            >
              {deleteLabel}
            </ProTechButton>
          )}

          {showCreate && (
            <ProTechButton
              variant="create"
              className="h-10 px-5 text-[16px]"
              icon={<Plus size={18} />}
            >
              {createLabel}
            </ProTechButton>
          )}
        </div>
      </div>

      <ProTechTable
        columns={columns}
        data={pagedData}
        limit={limit}
        page={safePage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        onPageChange={setPage}
      />
    </div>
  );
}

export function StatusBadge({
  label,
  tone = "success",
  onclick,
}:
  StatusBadgeProps
) {
  const toneClass = {
    success: "border-[#5AC56F] bg-white text-[#49A55B]",
    danger: "border-[#FF6B81] bg-white text-[#FF5D76]",
    neutral: "border-[#A8B1C2] bg-white  text-[#64748B]",
  };

  return (
    <span
      className={`inline-flex min-w-[62px] items-center justify-center rounded-md border px-2 py-1 text-[14px] leading-none ${toneClass[tone]}`}
      onClick={onclick}
    >
      {label}
    </span>
  );
}

export function ActionIcons({ showInfo = true }: { showInfo?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 text-[#2F66C5]">
      <button type="button" className="transition hover:opacity-75">
        <Edit3 size={20} />
      </button>

      {showInfo && (
        <button type="button" className="transition hover:opacity-75">
          <Info size={20} />
        </button>
      )}
    </div>
  );
}

export function PermissionTags({ items }: { items: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-[#3A6FCF] px-2 text-[14px] text-[#1F3E7A]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function CheckCell() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-7 w-7 rounded-md border border-[#A8B1C2] bg-white" />
    </div>
  );
}
