"use client";

import { useEffect, useMemo, useState } from "react";
import { ToolbarSelect } from "@/components/ui/toolbar-select";

import {
  ActionIcons,
  AdminTablePage,
  CheckCell,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import {
  ActionSuccessModal,
  type ManagementSuccessAction,
} from "@/components/admin/action-success-modal";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { SystemModal } from "@/components/systems/system-modal";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  useSystemTable,
  type SystemFormInput,
  type SystemListApiItem,
  type SystemStatusFilter,
} from "@/hooks/systems/use-system-type-table";
import type { Column } from "@/types/table";
import { formatThaiDateTime } from "../organizations/page";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type DialogMode = "create" | "edit";

type DialogState = {
  mode: DialogMode;
  item?: SystemListApiItem;
} | null;

type OrganizationOption = {
  id: number;
  name: string;
};

type SystemTableRow = {
  id: number;
  checked: boolean;
  name: string;
  organizationName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function SystemsPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SystemStatusFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [successAction, setSuccessAction] =
    useState<ManagementSuccessAction | null>(null);
  const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);
  const [organizationError, setOrganizationError] = useState<string | null>(null);

  const {
    items,
    pagination,
    loading,
    error,
    clearError,
    activeId,
    saving,
    statusOptions,
    createSystem,
    updateSystem,
    removeSystem,
  } = useSystemTable({
    page,
    search: appliedSearch,
    statusFilter,
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

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin-organizations/active`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load organizations (${response.status})`);
        }

        const result = (await response.json()) as Array<{
          id: number;
          name: string;
        }>;

        if (controller.signal.aborted) {
          return;
        }

        setOrganizationOptions(
          result.map((item) => ({
            id: item.id,
            name: item.name,
          })),
        );
        setOrganizationError(null);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        setOrganizationError("ไม่สามารถโหลดรายการองค์กรได้");
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  const rows = useMemo<SystemTableRow[]>(() => {
    return items.map((item) => ({
      id: item.id,
      checked: item.id === resolvedSelectedId,
      name: item.name || "-",
      organizationName: item.organizationName || "-",
      status: item.status || "-",
      createdAt: formatThaiDateTime(item.createdAt),
      updatedAt: formatThaiDateTime(item.updatedAt),
    }));
  }, [items, resolvedSelectedId]);

  function resetSelection() {
    setSelectedId(null);
  }

  function resetToFirstPage() {
    setPage(1);
  }

  function buildInitialValue(dialogState: DialogState): SystemFormInput {
    if (dialogState?.mode === "edit" && dialogState.item) {
      return {
        name: dialogState.item.name || "",
        organizationId: dialogState.item.organizationId ?? null,
        status: dialogState.item.status === "inactive" ? "inactive" : "active",
      };
    }

    return {
      name: "",
      organizationId: null,
      status: "active",
    };
  }

  function handleToggleSelect(id: number) {
    setSelectedId((current) => (current === id ? null : id));
  }

  async function handleDeleteSelected() {
    if (resolvedSelectedId === null) {
      return;
    }

    const success = await removeSystem(resolvedSelectedId);

    if (success) {
      resetSelection();
      setSuccessAction("delete");
    }
  }

  async function handleSubmit(payload: SystemFormInput) {
    const nextAction: ManagementSuccessAction =
      dialogState?.mode === "edit" ? "update" : "create";
    const success =
      dialogState?.mode === "edit" && dialogState.item
        ? await updateSystem(dialogState.item.id, payload)
        : await createSystem(payload);

    if (!success) {
      return;
    }

    setDialogState(null);
    setSuccessAction(nextAction);
  }

  const columns: Column<SystemTableRow>[] = [
    {
      key: "checked",
      title: "",
      className: "w-[72px] text-lg font-medium",
      render: (_, row) => (
        <CheckCell
          checked={row.checked}
          onClick={() => {
            handleToggleSelect(row.id);
          }}
        />
      ),
    },
    { key: "name", title: "ชื่อระบบ", className: "w-[120px] text-lg font-medium" },
    { key: "organizationName", title: "ชื่อองค์กร", className: "w-[120px] text-lg font-medium" },
    {
      key: "status",
      title: "สถานะ",
      className: "w-[124px] text-lg font-medium",
      render: (value) => {
        const status = String(value ?? "-");
        const tone =
          status === "active"
            ? "success"
            : status === "inactive"
              ? "danger"
              : "neutral";

        return <StatusBadge label={status} tone={tone} />;
      },
    },
    { key: "createdAt", title: "วันที่สร้าง", className: "w-[180px] text-lg font-medium" },
    { key: "updatedAt", title: "วันที่แก้ไข", className: "w-[180px] text-lg font-medium" },
    {
      key: "actions",
      title: "จัดการ",
      className: "w-[64px] text-lg font-medium",
      render: (_, row) => {
        const currentItem = items.find((item) => item.id === row.id);

        if (!currentItem) {
          return null;
        }

        return (
          <ActionIcons
            showInfo={false}
            onEdit={() => {
              setDialogState({ mode: "edit", item: currentItem });
            }}
          />
        );
      },
    },
  ];

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <AdminTablePage
        title="จัดการข้อมูลระบบ"
        subtitle="จัดการข้อมูลระบบที่เกี่ยวข้อง"
        columns={columns}
        data={rows}
        loading={loading}
        searchValue={searchValue}
        searchInputProps={{
          type: "search",
          inputMode: "search",
          autoComplete: "off",
          maxLength: 120,
          title: "ค้นหาด้วยชื่อระบบหรือชื่อองค์กร",
        }}
        searchPlaceholder="ค้นหาระบบ องค์กร"
        onSearchClick={(value) => {
          setSearchValue(value);
          setAppliedSearch(value);
          resetToFirstPage();
          resetSelection();
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

                <ToolbarSelect
                  value={statusFilter}
                  placeholder="สถานะทั้งหมด"
                  options={[
                    { value: "all", label: "สถานะทั้งหมด" },
                    ...statusOptions.map((option) => ({ value: option, label: option })),
                  ]}
                  onChange={(value) => {
                    setStatusFilter(value as SystemStatusFilter);
                    resetToFirstPage();
                    resetSelection();
                  }}
                />
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
                      disabled={resolvedSelectedId === null || activeId !== null}
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

            {organizationError ? (
              <div className="max-w-[420px] rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
                {organizationError}
              </div>
            ) : null}
          </div>
        )}
      />

      <SystemModal
        key={
          dialogState?.mode === "edit" && dialogState.item
            ? `edit-${dialogState.item.id}`
            : "create"
        }
        open={dialogState !== null}
        saving={saving || activeId !== null}
        mode={dialogState?.mode ?? "create"}
        initialValue={buildInitialValue(dialogState)}
        organizationOptions={organizationOptions}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
          }
        }}
        onSubmit={(payload) => {
          void handleSubmit(payload);
        }}
      />

      <ActionSuccessModal
        open={successAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessAction(null);
          }
        }}
        action={successAction ?? "create"}
        subject="ข้อมูลระบบ"
      />
    </div>
  );
}
