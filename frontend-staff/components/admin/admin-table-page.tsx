"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Edit3, Info, Plus, Trash2 } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearchBar } from "@/components/tables/protech-search";
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
  onClick?: () => void;
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
  hideCreateButton?: boolean;
  onSearchClick?: (value: string) => void;
  onCreateClick?: () => void;
  onConfirmDelete?: () => void;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
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
  hideCreateButton = false,
  onSearchClick,
  onCreateClick,
  onConfirmDelete,
  deleteConfirmTitle,
  deleteConfirmDescription,
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
  const resolvedShowCreate = hideCreateButton ? false : showCreate;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          {title}
        </h1>
        <p className="mt-2 text-[16px] text-[#8B95A7]">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <ProTechSearchBar
            placeholder={searchPlaceholder}
            className="flex-none"
            inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
              onSearchClick?.(value);
            }}
          />
          {/* 

            ค้นหา
          */}
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
                className="h-[31px] min-w-[124px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none"
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
            <DeleteConfirmDialog
              title={deleteConfirmTitle}
              description={deleteConfirmDescription}
              onConfirm={onConfirmDelete}
              trigger={
                <ProTechButton
                  variant="delete"
                  className="h-[31px] px-4 text-[14px]"
                  icon={<Trash2 size={16} />}
                >
                  {deleteLabel}
                </ProTechButton>
              }
            />
          )}

          {resolvedShowCreate && (
            <ProTechButton
              variant="create"
              className="h-[31px] px-4 text-[14px]"
              icon={<Plus size={16} />}
              onClick={onCreateClick}
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
  onClick,
}: StatusBadgeProps) {
  const toneClass = {
    success: "border-[#5AC56F] bg-white text-[#49A55B]",
    danger: "border-[#FF6B81] bg-white text-[#FF5D76]",
    neutral: "border-[#A8B1C2] bg-white text-[#64748B]",
  };

  return (
    <button
      type="button"
      className={`inline-flex min-w-[62px] items-center justify-center rounded-md border px-2 py-1 text-[14px] leading-none transition-all duration-200 ${toneClass[tone]} ${
        onClick
          ? "cursor-pointer hover:opacity-80 hover:shadow-sm"
          : "cursor-default"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ActionIcons({
  showInfo = true,
  onEdit,
  onInfo,
}: {
  showInfo?: boolean;
  onEdit?: () => void;
  onInfo?: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 text-[#2F66C5]">
      <button
        type="button"
        className="transition hover:opacity-75"
        onClick={onEdit}
      >
        <Edit3 size={20} />
      </button>

      {showInfo && (
        <button
          type="button"
          className="transition hover:opacity-75"
          onClick={onInfo}
        >
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

export function CheckCell({
  checked = false,
  onClick,
}: {
  checked?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        className={`flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200 ${
          checked
            ? "border-[#3F73BB] bg-[#3F73BB] text-white"
            : "border-[#A8B1C2] bg-white text-transparent hover:border-[#3F73BB] hover:bg-[#EEF4FF]"
        } ${onClick ? "cursor-pointer" : "cursor-default"}`}
      >
        <span className="text-[14px] font-bold leading-none">✓</span>
      </button>
    </div>
  );
}
