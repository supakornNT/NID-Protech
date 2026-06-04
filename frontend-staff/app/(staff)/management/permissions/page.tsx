"use client";

import { useMemo, useState } from "react";

import {
  ActionIcons,
  AdminTablePage,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import {
  ActionSuccessModal,
  type ManagementSuccessAction,
} from "@/components/admin/action-success-modal";
import { PermissionEditModal } from "@/components/permission/PermissionEditModal";
import {
  PermissionTeamTableRow,
  useTeamPermissionsPage,
} from "@/hooks/permission/useTeamPermissionsPage";
import type { Column } from "@/types/table";
import { formatThaiDateTime } from "../organizations/page";

export default function PermissionsPage() {
  const {
    page,
    setPage,
    searchValue,
    setSearchValue,
    rows,
    totalItems,
    totalPages,
    loading,
    error,
    dialogState,
    setDialogState,
    dialogLoading,
    saving,
    search,
    openEditDialog,
    submitDialog,
  } = useTeamPermissionsPage();
  const [successAction, setSuccessAction] =
    useState<ManagementSuccessAction | null>(null);

  const columns: Column<PermissionTeamTableRow>[] = useMemo(
    () => [
      { key: "order", title: "ลำดับ", className: "w-[100px]  text-lg font-medium" },
      {
        key: "teamName",
        title: "กลุ่ม",
        className: "w-[220px]  text-lg font-medium",
        render: (value) => (
          <span className="font-medium text-[#111827]">{String(value)}</span>
        ),
      },
      {
        key: "status",
        title: "สถานะ",
        className: "w-[120px]  text-lg font-medium",
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
      {
        key: "assignedPermissionCount",
        title: "จำนวนสิทธิ์",
        className: "w-[120px]  text-lg font-medium",
      },
      {
        key: "createdAt",
        title: "วันที่สร้าง",
        className: "w-[180px]  text-lg font-medium",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "updatedAt",
        title: "วันที่แก้ไข",
        className: "w-[180px]  text-lg font-medium",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "actions",
        title: "จัดการ",
        className: "w-[100px]  text-lg font-medium",
        render: (_, row) => (
          <ActionIcons
            showInfo={false}
            onEdit={() => {
              void openEditDialog(row.id);
            }}
          />
        ),
      },
    ],
    [openEditDialog],
  );

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
        <AdminTablePage
          title="จัดการสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม"
          subtitle="จัดการและแก้ไขข้อมูลกลุ่มผู้ใช้งาน"
          columns={columns}
          data={rows}
          searchValue={searchValue}
          searchPlaceholder="ค้นหาชื่อทีม"
          searchInputProps={{
            type: "search",
            inputMode: "search",
            autoComplete: "off",
            maxLength: 255,
            title: "ค้นหาด้วยชื่อทีม",
          }}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          disableClientFiltering
          disableClientPagination
          showCreate={false}
          showDelete={false}
          onSearchClick={(value) => {
            setSearchValue(value);
            search(value);
          }}
          loading={loading}
        />

        {error ? (
          <div className="max-w-105 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
            {error}
          </div>
        ) : null}
      </div>

      <PermissionEditModal
        open={dialogState !== null}
        loading={dialogLoading}
        saving={saving}
        value={dialogState}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
          }
        }}
        onChange={setDialogState}
        onSubmit={(nextValue) => {
          void (async () => {
            const success = await submitDialog(nextValue);

            if (success) {
              setSuccessAction("update");
            }
          })();
        }}
      />

      <ActionSuccessModal
        open={successAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessAction(null);
          }
        }}
        action={successAction ?? "update"}
        subject="สิทธิ์ของทีม"
      />
    </div>
  );
}
