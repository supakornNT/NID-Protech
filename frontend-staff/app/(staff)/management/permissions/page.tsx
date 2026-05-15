"use client";

import { useMemo } from "react";

import { ActionIcons } from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
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
        <div>
          <h1 className="text-[32px] font-bold leading-none text-[#111827]">
            จัดการสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม
          </h1>
          <p className="mt-2 text-[16px] text-[#8B95A7]">
            การจัดการแก้ไขข้อมูลกลุ่มผู้ใช้งาน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProTechSearch
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
            }}
            placeholder="ค้นหาชื่อทีม"
            inputProps={{
              type: "search",
              inputMode: "search",
              autoComplete: "off",
              maxLength: 255,
              title: "ค้นหาด้วยชื่อทีม",
            }}
            className="w-55.5 flex-none"
            inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
          />

          <ProTechButton
            variant="primary"
            className="h-7.75 min-w-18.5 px-4 text-[14px]"
            onClick={search}
          >
            ค้นหา
          </ProTechButton>
        </div>

        {error ? (
          <div className="max-w-105 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#8B95A7]">
            กำลังโหลดข้อมูลสิทธิ์ผู้ใช้งาน...
          </p>
        ) : (
          <ProTechTable
            columns={columns}
            data={rows}
            limit={pageLimit}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
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
import { PermissionTableRow, useTeamPermissionsPage } from "@/hooks/permission/useTeamPermissionsPage";import { PermissionEditModal } from "@/components/permission/PermissionEditModal";

