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
import { OrganizationModal } from "@/components/organizations/organization-modal";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  useOrganizationTable,
  type OrganizationApiItem,
  type OrganizationPayload,
} from "@/hooks/organizations/use-organization-table";
import { formatPhoneNumber } from "@/lib/utils";
import type { Column } from "@/types/table";

type DialogMode = "create" | "edit";

type DialogState = {
  mode: DialogMode;
  item?: OrganizationApiItem;
} | null;

type OrganizationRow = {
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dialogState, setDialogState] = useState<DialogState>(null);

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
  const resolvedSelectedIds = selectedIds.filter((selectedId) =>
    items.some((item) => item.id === selectedId),
  );

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

  const rows = useMemo<OrganizationRow[]>(() => {
    return items.map((item) => ({
      id: item.id,
      checked: resolvedSelectedIds.includes(item.id),
      organizationName: item.organizationName || "-",
      email: item.email || "-",
      phone: formatPhoneNumber(item.phone) || "-",
      organizationType: item.organizationType || "-",
      status: item.status || "-",
      createdAt: formatThaiDateTime(item.createdAt),
      updatedAt: formatThaiDateTime(item.updatedAt),
    }));
  }, [items, resolvedSelectedIds]);

  function resetSelection() {
    setSelectedIds([]);
  }

  function resetToFirstPage() {
    setPage(1);
  }

  function buildInitialValue(dialogState: DialogState): OrganizationPayload {
    if (dialogState?.mode === "edit" && dialogState.item) {
      return {
        name: dialogState.item.organizationName || "",
        type: dialogState.item.organizationType || "company",
        email: dialogState.item.email || "",
        phone: dialogState.item.phone || "",
        status: dialogState.item.status || "active",
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
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  async function handleDeleteSelected() {
    if (resolvedSelectedIds.length === 0) {
      return;
    }

    for (const id of resolvedSelectedIds) {
      const success = await removeOrganization(id);

      if (!success) {
        break;
      }
    }

    resetSelection();
  }

  async function handleSubmit(payload: OrganizationPayload) {
    const success =
      dialogState?.mode === "edit" && dialogState.item
        ? await updateOrganization(dialogState.item.id, payload)
        : await createOrganization(payload);

    if (!success) {
      return;
    }

    setDialogState(null);
  }

  const columns: Column<OrganizationRow>[] = [
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
    { key: "organizationName", title: "ชื่อองค์กร" },
    { key: "email", title: "อีเมล" },
    { key: "phone", title: "เบอร์โทร" },
    { key: "organizationType", title: "ประเภท" },
    {
      key: "status",
      title: "สถานะ",
      className: "w-[124px]",
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
    { key: "createdAt", title: "วันที่สร้าง", className: "w-[180px]" },
    { key: "updatedAt", title: "วันที่แก้ไข", className: "w-[180px]" },
    {
      key: "actions",
      title: "จัดการ",
      className: "w-[64px]",
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
        searchPlaceholder="ค้นหาชื่อองค์กร อีเมล เบอร์โทร"
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

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      resetToFirstPage();
                      resetSelection();
                    }}
                    className="h-[31px] min-w-[124px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none"
                  >
                    <option value="all">สถานะทั้งหมด</option>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B95A7]" />
                </div>

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(event) => {
                      setTypeFilter(event.target.value);
                      resetToFirstPage();
                      resetSelection();
                    }}
                    className="h-[31px] min-w-[132px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none"
                  >
                    <option value="all">ประเภททั้งหมด</option>
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
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
                      disabled={resolvedSelectedIds.length === 0 || activeId !== null}
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
    </div>
  );
}
