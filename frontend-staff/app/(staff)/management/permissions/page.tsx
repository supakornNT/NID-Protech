"use client";

import { useMemo } from "react";

import {
  ActionIcons,
  AdminTablePage,
} from "@/components/admin/admin-table-page";
import { PermissionEditModal } from "@/components/permission/PermissionEditModal";
import {
  PermissionTableRow,
  useTeamPermissionsPage,
} from "@/hooks/permission/useTeamPermissionsPage";
import type { Column } from "@/types/table";

export default function PermissionsPage() {
  const {
    pageLimit,
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

  const columns: Column<PermissionTableRow>[] = useMemo(
    () => [
      {
        key: "order",
        title: "ลำดับ",
        className: "w-[180px]",
      },
      {
        key: "teamName",
        title: "กลุ่ม",
        className: "w-[340px]",
        render: (value) => (
          <span className="font-medium text-[#111827]">{String(value)}</span>
        ),
      },
      {
        key: "actions",
        title: "จัดการ",
        className: "w-[160px]",
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
            search();
          }}
        />

        {error ? (
          <div className="max-w-105 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#8B95A7]">
            กำลังโหลดข้อมูลสิทธิ์ผู้ใช้งาน...
          </p>
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
          void submitDialog(nextValue);
        }}
      />
    </div>
  );
}