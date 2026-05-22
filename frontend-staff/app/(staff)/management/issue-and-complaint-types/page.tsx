"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  ActionIcons,
  AdminTablePage,
  CheckCell,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { ProblemTypeModal } from "@/components/problem-types/problem-type-modal";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  useProblemTypeTable,
  type ProblemTypeFilter,
  type ProblemTypeFormInput,
  type ProblemTypeListApiItem,
} from "@/hooks/problem-types/use-problem-type-table";
import type { Column } from "@/types/table";
import { formatThaiDateTime } from "../organizations/page";

const CATEGORY_OPTIONS = [
  { value: "all", label: "หมวดทั้งหมด" },
  { value: "issue", label: "ปัญหา" },
  { value: "complaint", label: "ข้อร้องเรียน" },
] as const;

type DialogState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      item: ProblemTypeListApiItem;
    }
  | null;

type ProblemTypeTableRow = {
  id: number;
  checked: boolean;
  code: string;
  categoryLabel: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: string;
};

function mapCategoryLabel(requestType: ProblemTypeListApiItem["requestType"]) {
  return requestType === "complaint" ? "ข้อร้องเรียน" : "ปัญหา";
}


function buildInitialValue(dialogState: DialogState): ProblemTypeFormInput {
  if (dialogState?.mode === "edit") {
    return {
      code: dialogState.item.code,
      name: dialogState.item.name,
      requestType:
        dialogState.item.requestType === "complaint" ? "complaint" : "issue",
      status: dialogState.item.status === "inactive" ? "inactive" : "active",
    };
  }

  return {
    code: "",
    name: "",
    requestType: "issue",
    status: "active",
  };
}

export default function ProblemTypesPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProblemTypeFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(null);

  const {
    items,
    pagination,
    loading,
    error,
    clearError,
    activeId,
    saving,
    createProblemType,
    updateProblemType,
    removeProblemType,
  } = useProblemTypeTable({
    page,
    search: appliedSearch,
    requestType: categoryFilter,
  });

  const safePage = Math.min(page, Math.max(pagination.totalPages, 1));
  const resolvedSelectedId =
    selectedId !== null && items.some((item) => item.id === selectedId)
      ? selectedId
      : null;

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearError();
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearError, error]);

  const rows = useMemo<ProblemTypeTableRow[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        checked: item.id === resolvedSelectedId,
        code: item.code ?? "",
        categoryLabel: mapCategoryLabel(item.requestType),
        name: item.name,
        createdAt: formatThaiDateTime(item.createdAt),
        updatedAt: formatThaiDateTime(item.updatedAt),
        status: item.status,
      })),
    [items, resolvedSelectedId],
  );

  function resetToFirstPage() {
    setPage(1);
  }

  async function handleSubmit(payload: ProblemTypeFormInput) {
    const success =
      dialogState?.mode === "edit"
        ? await updateProblemType(dialogState.item.id, payload)
        : await createProblemType(payload);

    if (!success) {
      return;
    }

    setDialogState(null);
  }

  async function handleDeleteSelected() {
    if (resolvedSelectedId === null) {
      return;
    }

    const success = await removeProblemType(resolvedSelectedId);

    if (success) {
      setSelectedId(null);
    }
  }

  const columns: Column<ProblemTypeTableRow>[] = [
    {
      key: "checked",
      title: "",
      className: "w-[72px] ",
      render: (_, row) => (
        <CheckCell
          checked={row.checked}
          onClick={() => {
            setSelectedId((current) => (current === row.id ? null : row.id));
          }}
        />
      ),
    },
    { key: "code", title: "รหัส", className: "w-[90px] text-lg font-medium" },
    { key: "categoryLabel", title: "หมวด", className: "w-[90px] text-lg font-medium" },
    { key: "name", title: "ประเภท", className: "w-[200px] text-lg font-medium" },
     
    {
      key: "status",
      title: "สถานะ",
      className: "w-[80px] text-lg font-medium",
      render: (value) => {
        const status = String(value ?? "-");
        const tone = status === "active" ? "success" : "danger";

        return <StatusBadge label={status} tone={tone} />;
      },
    },
    { key: "createdAt", title: "วันที่สร้าง", className: "w-[90px] text-lg font-medium" },
      { key: "updatedAt", title: "วันที่แก้ไข", className: "w-[90px] text-lg font-medium" },
    {
      key: "actions",
      title: "จัดการ",
      className: "w-[64px] text-lg font-medium",
      render: (_, row) => (
        <ActionIcons
          showInfo={false}
          onEdit={() => {
            const item = items.find((problemType) => problemType.id === row.id);

            if (!item) {
              return;
            }

            setDialogState({
              mode: "edit",
              item,
            });
          }}
        />
      ),
    },
  ];

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <AdminTablePage
        title="จัดการรูปแบบปัญหาและข้อร้องเรียน"
        subtitle="จัดการข้อมูลหมวดและประเภทสำหรับปัญหา/ข้อร้องเรียน"
        columns={columns}
        data={rows}
        searchValue={searchValue}
        searchInputProps={{
          type: "search",
          inputMode: "search",
          autoComplete: "off",
          maxLength: 100,
          title: "ค้นหาด้วยชื่อประเภทของปัญหาหรือข้อร้องเรียน",
        }}
        searchPlaceholder="ค้นหาประเภท"
        onSearchClick={(value) => {
          setSearchValue(value);
          setAppliedSearch(value);
          resetToFirstPage();
        }}
        page={safePage}
        totalPages={Math.max(pagination.totalPages, 1)}
        totalItems={pagination.total}
        onPageChange={setPage}
        disableClientFiltering
        disableClientPagination
        showCreate={false}
        showDelete={false}
        renderToolbar={({ searchBar }) => (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                {searchBar}

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(event) => {
                      setCategoryFilter(event.target.value as ProblemTypeFilter);
                      resetToFirstPage();
                    }}
                    className="h-[31px] min-w-[132px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B95A7]" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <DeleteConfirmDialog
                  title="ยืนยันการลบข้อมูล"
                  description="เมื่อลบข้อมูลแล้วจะไม่สามารถกู้คืนกลับได้"
                  onConfirm={() => {
                    void handleDeleteSelected();
                  }}
                  trigger={
                    <ProTechButton
                      variant="delete"
                      className="h-[31px] px-4 text-[14px]"
                      disabled={
                        resolvedSelectedId === null || activeId !== null
                      }
                    >
                      ลบ
                    </ProTechButton>
                  }
                />

                <ProTechButton
                  variant="create"
                  className="h-[31px] px-4 text-[14px]"
                  onClick={() => {
                    setDialogState({ mode: "create" });
                  }}
                >
                  สร้าง
                </ProTechButton>
              </div>
            </div>

            {error ? (
              <div className="max-w-[420px] rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
                {error}
              </div>
            ) : null}
          </div>
        )}
      />

      {loading ? (
        <p className="mt-4 text-sm text-[#8B95A7]">
          กำลังโหลดข้อมูลประเภทปัญหาและข้อร้องเรียน...
        </p>
      ) : null}

      <ProblemTypeModal
        key={
          dialogState?.mode === "edit"
            ? `edit-${dialogState.item.id}`
            : "create"
        }
        open={dialogState !== null}
        saving={saving || activeId !== null}
        mode={dialogState?.mode ?? "create"}
        initialValue={buildInitialValue(dialogState)}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
          }
        }}
        onSubmit={(payload) => {
          void handleSubmit(payload);
        }}
      />
    </div>
  );
}
