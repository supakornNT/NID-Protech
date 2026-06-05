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
import { OrganizationModal } from "@/components/organizations/organization-modal";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  useOrganizationTable,
  type OrganizationListApiItem,
  type OrganizationFormInput,
  type OrganizationStatusFilter,
  type OrganizationTypeFilter,
} from "@/hooks/organizations/use-organization-table";
import { formatPhoneNumber } from "@/lib/utils";
import type { Column } from "@/types/table";

type DialogMode = "create" | "edit";

type DialogState = {
  mode: DialogMode;
  item?: OrganizationListApiItem;
} | null;

type OrganizationTableRow = {
  id: number;
  checked: boolean;
  organizationName: string;
  email: string;
  phone: string;
  organizationType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function formatThaiDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrganizationStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<OrganizationTypeFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [successAction, setSuccessAction] =
    useState<ManagementSuccessAction | null>(null);

  const {
    items,
    pagination,
    loading,
    error,
    clearError,
    activeId,
    saving,
    statusOptions,
    typeOptions,
    createOrganization,
    updateOrganization,
    removeOrganization,
  } = useOrganizationTable({
    page,
    search: appliedSearch,
    statusFilter,
    typeFilter,
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

  const rows = useMemo<OrganizationTableRow[]>(() => {
    return items.map((item) => ({
      id: item.id,
      checked: item.id === resolvedSelectedId,
      organizationName: item.organizationName || "-",
      email: item.email || "-",
      phone: formatPhoneNumber(item.phone) || "-",
      organizationType: item.organizationType || "-",
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

  function buildInitialValue(dialogState: DialogState): OrganizationFormInput {
    if (dialogState?.mode === "edit" && dialogState.item) {
      return {
        name: dialogState.item.organizationName || "",
        type:
          dialogState.item.organizationType === "government" ||
          dialogState.item.organizationType === "other"
            ? dialogState.item.organizationType
            : "company",
        email: dialogState.item.email || "",
        phone: dialogState.item.phone || "",
        status: dialogState.item.status === "inactive" ? "inactive" : "active",
      };
    }

    return {
      name: "",
      type: "company",
      email: "",
      phone: "",
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

    const success = await removeOrganization(resolvedSelectedId);

    if (success) {
      resetSelection();
      setSuccessAction("delete");
    }
  }

  async function handleSubmit(payload: OrganizationFormInput) {
    const nextAction: ManagementSuccessAction =
      dialogState?.mode === "edit" ? "update" : "create";
    const success =
      dialogState?.mode === "edit" && dialogState.item
        ? await updateOrganization(dialogState.item.id, payload)
        : await createOrganization(payload);

    if (!success) {
      return;
    }

    setDialogState(null);
    setSuccessAction(nextAction);
  }

  const columns: Column<OrganizationTableRow>[] = [
    {
      key: "checked",
      title: "",
      className: "w-[72px]",
      render: (_, row) => (
        <CheckCell
          checked={row.checked}
          onClick={() => {
            handleToggleSelect(row.id);
          }}
        />
      ),
    },
    { key: "organizationName", title: "ชื่อองค์กร", className: "w-[90px] text-lg font-medium" },
    { key: "email", title: "อีเมล", className: "w-[90px] text-lg font-medium" },
    { key: "phone", title: "เบอร์โทร", className: "w-[90px] text-lg font-medium" },
    { key: "organizationType", title: "ประเภท", className: "w-[90px] text-lg font-medium" },
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
        title="จัดการข้อมูลองค์กร"
        subtitle="จัดการข้อมูลองค์กรที่เกี่ยวข้อง"
        columns={columns}
        data={rows}
        searchValue={searchValue}
        searchInputProps={{
          type: "search",
          inputMode: "search",
          autoComplete: "off",
          maxLength: 120,
          title: "ค้นหาด้วยชื่อองค์กร อีเมล หรือเบอร์โทร",
        }}
        searchPlaceholder="ค้นหาองค์กร อีเมล เบอร์โทร"
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
                    setStatusFilter(value as OrganizationStatusFilter);
                    resetToFirstPage();
                    resetSelection();
                  }}
                  className="flex-1 min-w-[120px] sm:flex-none sm:w-[132px]"
                />

                <ToolbarSelect
                  value={typeFilter}
                  placeholder="ประเภททั้งหมด"
                  options={[
                    { value: "all", label: "ประเภททั้งหมด" },
                    ...typeOptions.map((option) => ({ value: option, label: option })),
                  ]}
                  onChange={(value) => {
                    setTypeFilter(value as OrganizationTypeFilter);
                    resetToFirstPage();
                    resetSelection();
                  }}
                  className="flex-1 min-w-[120px] sm:flex-none sm:w-[132px]"
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
          </div>
        )}
      />

      {loading ? (
        <p className="mt-4 text-sm text-[#8B95A7]">กำลังโหลดข้อมูลองค์กร...</p>
      ) : null}

      <OrganizationModal
        key={
          dialogState?.mode === "edit" && dialogState.item
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

      <ActionSuccessModal
        open={successAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessAction(null);
          }
        }}
        action={successAction ?? "create"}
        subject="ข้อมูลองค์กร"
      />
    </div>
  );
}
