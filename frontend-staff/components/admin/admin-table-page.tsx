"use client";

import { useMemo, useState, type ReactNode } from "react";
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
  deleteDisabled?: boolean;
  searchValue?: string;
  filterValues?: Record<string, string>;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  disableClientFiltering?: boolean;
  disableClientPagination?: boolean;
  renderToolbar?: (parts: {
    searchBar: ReactNode;
    filterControls: ReactNode;
    actionButtons: ReactNode;
  }) => ReactNode;
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
  deleteDisabled = false,
  searchValue,
  filterValues,
  page,
  totalPages,
  totalItems,
  onPageChange,
  disableClientFiltering = false,
  disableClientPagination = false,
  renderToolbar,
}: AdminTablePageProps<T>) {
  const [internalPage, setInternalPage] = useState(1);
  const [internalSearch, setInternalSearch] = useState("");
  const [internalSelectedFilters, setInternalSelectedFilters] = useState<
    Record<string, string>
  >(Object.fromEntries(filters.map((filter) => [filter.key, "all"])));

  const isControlledPagination =
    typeof page === "number" &&
    typeof totalPages === "number" &&
    typeof totalItems === "number" &&
    typeof onPageChange === "function";

  const resolvedSearch = searchValue ?? internalSearch;
  const resolvedSelectedFilters = filterValues ?? internalSelectedFilters;

  const filteredData = useMemo(() => {
    if (disableClientFiltering) {
      return data;
    }

    const normalizedSearch = resolvedSearch.trim().toLowerCase();

    return data.filter((row) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );

      const matchesFilters = filters.every((filter) => {
        const selected = resolvedSelectedFilters[filter.key];

        if (!selected || selected === "all") {
          return true;
        }

        return String(row[filter.key] ?? "") === selected;
      });

      return matchesSearch && matchesFilters;
    });
  }, [
    data,
    disableClientFiltering,
    filters,
    resolvedSearch,
    resolvedSelectedFilters,
  ]);

  const limit = 10;
  const resolvedTotalPages = isControlledPagination
    ? Math.max(1, totalPages)
    : Math.max(1, Math.ceil(filteredData.length / limit));
  const resolvedPage = isControlledPagination ? page : internalPage;
  const safePage = Math.min(resolvedPage, resolvedTotalPages);
  const pagedData =
    disableClientPagination || isControlledPagination
      ? filteredData
      : filteredData.slice((safePage - 1) * limit, safePage * limit);
  const resolvedTotalItems = isControlledPagination ? totalItems : filteredData.length;
  const resolvedShowCreate = hideCreateButton ? false : showCreate;

  const searchBar = (
    <ProTechSearchBar
      value={resolvedSearch}
      placeholder={searchPlaceholder}
      className="flex-none"
      inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
      onSearch={(value) => {
        if (searchValue === undefined) {
          setInternalSearch(value);
        }

        if (isControlledPagination) {
          onPageChange(1);
        } else {
          setInternalPage(1);
        }

        onSearchClick?.(value);
      }}
    />
  );

  const filterControls = (
    <>
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={resolvedSelectedFilters[filter.key] ?? "all"}
            onChange={(event) => {
              if (filterValues === undefined) {
                setInternalSelectedFilters((current) => ({
                  ...current,
                  [filter.key]: event.target.value,
                }));
              }

              if (isControlledPagination) {
                onPageChange(1);
              } else {
                setInternalPage(1);
              }
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
    </>
  );

  const actionButtons = (
    <>
      {showDelete ? (
        <DeleteConfirmDialog
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          onConfirm={onConfirmDelete}
          trigger={
            <ProTechButton
              variant="delete"
              className="h-[31px] px-4 text-[14px]"
              icon={<Trash2 size={16} />}
              disabled={deleteDisabled}
            >
              {deleteLabel}
            </ProTechButton>
          }
        />
      ) : null}

      {resolvedShowCreate ? (
        <ProTechButton
          variant="create"
          className="h-[31px] px-4 text-[14px]"
          icon={<Plus size={16} />}
          onClick={onCreateClick}
        >
          {createLabel}
        </ProTechButton>
      ) : null}
    </>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          {title}
        </h1>
        <p className="mt-2 text-[16px] text-[#8B95A7]">{subtitle}</p>
      </div>

      {renderToolbar ? (
        renderToolbar({ searchBar, filterControls, actionButtons })
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {searchBar}
            {filterControls}
          </div>

          <div className="flex items-center justify-end gap-3">
            {actionButtons}
          </div>
        </div>
      )}

      <ProTechTable
        columns={columns}
        data={pagedData}
        limit={limit}
        page={safePage}
        totalPages={resolvedTotalPages}
        totalItems={resolvedTotalItems}
        onPageChange={(nextPage) => {
          if (isControlledPagination) {
            onPageChange(nextPage);
            return;
          }

          setInternalPage(nextPage);
        }}
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

      {showInfo ? (
        <button
          type="button"
          className="transition hover:opacity-75"
          onClick={onInfo}
        >
          <Info size={20} />
        </button>
      ) : null}
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
        <span className="text-[14px] font-bold leading-none">✔</span>
      </button>
    </div>
  );
}
