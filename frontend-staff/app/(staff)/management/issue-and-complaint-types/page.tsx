"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  ActionIcons,
  AdminTablePage,
  CheckCell,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { ProblemTypeModal } from "@/components/problem-types/problem-type-modal";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  useProblemTypeTable,
  type ProblemTypeApiItem,
  type ProblemTypePayload,
} from "@/hooks/problem-types/use-problem-type-table";
import type { Column } from "@/types/table";

const PAGE_SIZE = 10;
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
      item: ProblemTypeApiItem;
    }
  | null;

type ProblemTypeRow = {
  id: number;
  checked: boolean;
  code: string;
  categoryLabel: string;
  name: string;
  status: string;
};

function mapCategoryLabel(requestType: ProblemTypeApiItem["request_type"]) {
  return requestType === "complaint" ? "ข้อร้องเรียน" : "ปัญหา";
}

function buildInitialValue(dialogState: DialogState): ProblemTypePayload {
  if (dialogState?.mode === "edit") {
    return {
      code: dialogState.item.code,
      name: dialogState.item.name,
      requestType: dialogState.item.request_type,
      status: dialogState.item.status,
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dialogState, setDialogState] = useState<DialogState>(null);

  const {
    items,
    loading,
    error,
    activeId,
    saving,
    createProblemType,
    updateProblemType,
    removeProblemType,
  } = useProblemTypeTable({
    search: appliedSearch,
    requestType: categoryFilter,
  });

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return items.slice(startIndex, startIndex + PAGE_SIZE);
  }, [items, safePage]);

  const rows = useMemo<ProblemTypeRow[]>(
    () =>
      pagedItems.map((item) => ({
        id: item.id,
        checked: selectedIds.includes(item.id),
        code: item.code ?? "",
        categoryLabel: mapCategoryLabel(item.request_type),
        name: item.name,
        status: item.status,
      })),
    [pagedItems, selectedIds],
  );

  function resetSelection() {
    setSelectedIds([]);
  }

  function resetToFirstPage() {
    setPage(1);
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function handleToggleSelectAll() {
    const pageIds = pagedItems.map((item) => item.id);
    const hasUnchecked = pageIds.some((id) => !selectedIds.includes(id));

    if (hasUnchecked) {
      setSelectedIds((current) => Array.from(new Set([...current, ...pageIds])));
      return;
    }

    setSelectedIds((current) => current.filter((id) => !pageIds.includes(id)));
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    for (const id of selectedIds) {
      const success = await removeProblemType(id);

      if (!success) {
        break;
      }
    }

    resetSelection();
  }

  async function handleSubmit(payload: ProblemTypePayload) {
    const success =
      dialogState?.mode === "edit"
        ? await updateProblemType(dialogState.item.id, payload)
        : await createProblemType(payload);

    if (!success) {
      return;
    }

    setDialogState(null);
    resetSelection();
  }

  const allSelected =
    pagedItems.length > 0 &&
    pagedItems.every((item) => selectedIds.includes(item.id));

  const columns: Column<ProblemTypeRow>[] = [
    {
      key: "checked",
      title: <CheckCell checked={allSelected} onClick={handleToggleSelectAll} />,
      className: "w-[72px]",
      render: (_, row) => (
        <CheckCell checked={row.checked} onClick={() => handleToggleSelect(row.id)} />
      ),
    },
    { key: "code", title: "รหัส", className: "w-[90px]" },
    { key: "categoryLabel", title: "หมวด", className: "w-[90px]" },
    { key: "name", title: "ประเภท", className: "w-[200px]" },
    {
      key: "status",
      title: "สถานะ",
      className: "w-[80px]",
      render: (value) => {
        const status = String(value ?? "-");
        const tone = status === "active" ? "success" : "danger";

        return <StatusBadge label={status} tone={tone} />;
      },
    },
    {
      key: "actions",
      title: "จัดการ",
      className: "w-[50px]",
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
      {error ? (
        <p className="mb-5 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
          {error}
        </p>
      ) : null}

      <AdminTablePage
        title="จัดการรูปแบบปัญหาและข้อร้องเรียน"
        subtitle="จัดการข้อมูลหมวดและประเภทสำหรับปัญหา/ข้อร้องเรียน"
        columns={columns}
        data={rows}
        searchValue={searchValue}
        searchPlaceholder="ค้นหาประเภท"
        onSearchClick={(value) => {
          setSearchValue(value);
          setAppliedSearch(value);
          resetToFirstPage();
          resetSelection();
        }}
        page={safePage}
        totalPages={totalPages}
        totalItems={items.length}
        onPageChange={setPage}
        disableClientFiltering
        disableClientPagination
        showCreate={false}
        showDelete={false}
        renderToolbar={({ searchBar }) => (
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {searchBar}

              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value);
                    resetToFirstPage();
                    resetSelection();
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
              <ProTechButton
                variant="delete"
                className="h-[31px] px-4 text-[14px]"
                disabled={selectedIds.length === 0 || activeId !== null}
                onClick={() => {
                  void handleDeleteSelected();
                }}
              >
                ลบ
              </ProTechButton>

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
        )}
      />

      {loading ? (
        <p className="mt-4 text-sm text-[#8B95A7]">
          กำลังโหลดข้อมูลประเภทปัญหาและข้อร้องเรียน...
        </p>
      ) : null}

      <ProblemTypeModal
        key={
          dialogState?.mode === "edit" ? `edit-${dialogState.item.id}` : "create"
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
