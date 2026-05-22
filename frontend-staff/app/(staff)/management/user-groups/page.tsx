"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";

import {
  ActionIcons,
  CheckCell,
  PermissionTags,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { TeamGroupModal } from "@/components/user-groups/team-group-modal";
import { TeamMemberModal } from "@/components/user-groups/team-member-modal";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearchBar } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import {
  UserGroupMemberTableRow,
  UserGroupTableRow,
  useUserGroupsPage,
} from "@/hooks/user-groups/use-user-groups-page";
import type { Column } from "@/types/table";
import { formatThaiDateTime } from "../organizations/page";

function renderStatus(status: string) {
  if (status === "active") {
    return <StatusBadge label="ใช้งาน" tone="success" />;
  }

  if (status === "inactive") {
    return <StatusBadge label="ปิดใช้งาน" tone="danger" />;
  }

  return <StatusBadge label={status} tone="neutral" />;
}

function ToolbarSelect({
  value,
  options,
  placeholder,
  onChange,
  minWidthClassName = "min-w-[132px]",
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  onChange: (value: string) => void;
  minWidthClassName?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className={`h-[31px] ${minWidthClassName} appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none`}
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B95A7]" />
    </div>
  );
}

export default function UserGroupsPage() {
  const {
    activeTab,
    setActiveTab,
    searchValue,
    setSearchValue,
    groupStatusFilter,
    teamFilter,
    setTeamFilter,
    memberGroupFilter,
    setMemberGroupFilter,
    setGroupStatusFilter,
    groupPage,
    setGroupPage,
    memberPage,
    setMemberPage,
    selectedGroupId,
    setSelectedGroupId,
    groupRows,
    groupTotalItems,
    groupTotalPages,
    memberRows,
    memberTotalItems,
    memberTotalPages,
    loading,
    saving,
    error,
    groupDialogState,
    setGroupDialogState,
    memberDialogState,
    setMemberDialogState,
    staffOptions,
    activeTeamOptions,
    search,
    openCreateGroupDialog,
    openEditGroupDialog,
    submitGroupDialog,
    deleteSelectedGroup,
    openEditMemberDialog,
    submitMemberDialog,
  } = useUserGroupsPage();

  const groupColumns: Column<UserGroupTableRow>[] = useMemo(
    () => [
      {
        key: "checked",
        title: "",
        className: "w-[72px]",
        render: (_, row) => (
          <CheckCell
            checked={row.checked}
            onClick={() => {
              setSelectedGroupId((current) =>
                current === row.id ? null : row.id,
              );
            }}
          />
        ),
      },
      // { key: "order", title: "ลำดับ", className: "w-[100px]" },
      { key: "groupName", title: "กลุ่ม", className: "w-[220px]" },

      {
        key: "memberCount",
        title: "จำนวนสมาชิก",
        className: "w-[140px]",
      },
      {
        key: "status",
        title: "สถานะ",
        className: "w-[140px]",
        render: (value) => renderStatus(String(value)),
      },
      {
        key: "createdAt",
        title: "วันที่สร้าง",
        className: "w-[180px]",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "updatedAt",
        title: "วันที่แก้ไข",
        className: "w-[180px]",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "actions",
        title: "จัดการ",
        className: "w-[120px]",
        render: (_, row) => (
          <ActionIcons
            showInfo={false}
            onEdit={() => {
              openEditGroupDialog(row.id);
            }}
          />
        ),
      },
    ],
    [openEditGroupDialog, setSelectedGroupId],
  );

  const memberColumns: Column<UserGroupMemberTableRow>[] = useMemo(
    () => [
      { key: "order", title: "ลำดับ", className: "w-[100px]" },
      { key: "fullName", title: "ชื่อ-นามสกุล", className: "w-[220px]" },
      { key: "email", title: "อีเมล", className: "w-[220px]" },
      {
        key: "status",
        title: "สถานะ",
        className: "w-[140px]",
        render: (value) => renderStatus(String(value)),
      },
      {
        key: "teams",
        title: "กลุ่ม",
        className: "w-[260px]",
        render: (_, row) =>
          row.teams.length > 0 ? (
            <PermissionTags items={row.teams} />
          ) : (
            <span className="text-[#8B95A7]">-</span>
          ),
      },
      {
        key: "createdAt",
        title: "วันที่สร้าง",
        className: "w-[180px]",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "updatedAt",
        title: "วันที่แก้ไข",
        className: "w-[180px]",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "actions",
        title: "จัดการ",
        className: "w-[120px]",
        render: (_, row) => (
          <ActionIcons
            showInfo={false}
            onEdit={() => {
              openEditMemberDialog(row.id);
            }}
          />
        ),
      },
    ],
    [openEditMemberDialog],
  );

  const isGroupsTab = activeTab === "groups";

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
        <div>
          <h1 className="text-[32px] font-bold leading-none text-[#111827]">
            จัดการกลุ่มผู้ใช้งาน
          </h1>
          <p className="mt-2 text-[16px] text-[#8B95A7]">
            จัดการกลุ่มผู้ใช้งาน เพิ่มคนเข้ากลุ่ม
            และตรวจสอบว่าผู้ใช้งานอยู่ในกลุ่มใดบ้าง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative inline-flex items-end gap-8 px-3 pb-2">
            <span className="absolute inset-x-0 bottom-0 h-px bg-[#111827]" />
            <button
              type="button"
              className={`relative pb-1 pt-1 text-[16px] font-medium transition-colors duration-150 ${
                isGroupsTab
                  ? "text-[#3F73BB]"
                  : "text-[#111827] hover:text-[#3F73BB]"
              }`}
              onClick={() => {
                setActiveTab("groups");
                setGroupPage(1);
                setSelectedGroupId(null);
                setGroupStatusFilter("all");
                setMemberGroupFilter("all");
              }}
            >
              กลุ่ม
              {isGroupsTab ? (
                <span className="absolute inset-x-0 -bottom-2 h-0.5 bg-[#3F73BB]" />
              ) : null}
            </button>
            <button
              type="button"
              className={`relative pb-1 pt-1 text-[16px] font-medium transition-colors duration-150 ${
                !isGroupsTab
                  ? "text-[#3F73BB]"
                  : "text-[#111827] hover:text-[#3F73BB]"
              }`}
              onClick={() => {
                setActiveTab("members");
                setMemberPage(1);
                setSelectedGroupId(null);
                setTeamFilter("all");
                setMemberGroupFilter("all");
              }}
            >
              จัดการคนในกลุ่ม
              {!isGroupsTab ? (
                <span className="absolute inset-x-0 -bottom-2 h-0.5 bg-[#3F73BB]" />
              ) : null}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-2">
            <ProTechSearchBar
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder={
                isGroupsTab ? "ค้นหาชื่อกลุ่ม" : "ค้นหาชื่อผู้ใช้หรืออีเมล"
              }
              onSearch={search}
              inputProps={{
                type: "search",
                inputMode: "search",
                autoComplete: "off",
                maxLength: 255,
                title: isGroupsTab
                  ? "ค้นหาด้วยชื่อกลุ่ม"
                  : "ค้นหาด้วยชื่อผู้ใช้ อีเมล หรือชื่อกลุ่ม",
              }}
              inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
            />

            {isGroupsTab ? (
              <ToolbarSelect
                value={groupStatusFilter}
                placeholder="สถานะทั้งหมด"
                options={[
                  { value: "active", label: "ใช้งาน" },
                  { value: "inactive", label: "ปิดใช้งาน" },
                ]}
                onChange={(value) => {
                  setGroupStatusFilter(value as "all" | "active" | "inactive");
                  setGroupPage(1);
                  setSelectedGroupId(null);
                }}
              />
            ) : (
              <>
                <ToolbarSelect
                  value={String(teamFilter)}
                  placeholder="ทีมทั้งหมด"
                  options={activeTeamOptions.map((team) => ({
                    value: String(team.value),
                    label: team.label,
                  }))}
                  onChange={(value) => {
                    setTeamFilter(value === "all" ? "all" : Number(value));
                    setMemberPage(1);
                  }}
                />
                <ToolbarSelect
                  value={memberGroupFilter}
                  placeholder="สถานะกลุ่มทั้งหมด"
                  options={[
                    { value: "with-group", label: "มีกลุ่ม" },
                    { value: "without-group", label: "ไม่มีกลุ่ม" },
                  ]}
                  minWidthClassName="min-w-[168px]"
                  onChange={(value) => {
                    setMemberGroupFilter(
                      value as "all" | "with-group" | "without-group",
                    );
                    setMemberPage(1);
                  }}
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {isGroupsTab ? (
              <DeleteConfirmDialog
                title="ยืนยันการลบข้อมูล"
                description="เมื่อลบกลุ่มผู้ใช้งานแล้วจะไม่สามารถกู้คืนกลับได้ หากกลุ่มถูกใช้งานอยู่ระบบจะไม่อนุญาตให้ลบ"
                onConfirm={() => {
                  void deleteSelectedGroup();
                }}
                trigger={
                  <ProTechButton
                    variant="delete"
                    className="h-7.75 px-4 text-[14px]"
                    disabled={saving || selectedGroupId === null}
                  >
                    ลบ
                  </ProTechButton>
                }
              />
            ) : null}

            {isGroupsTab ? (
              <ProTechButton
                variant="create"
                className="h-7.75 px-4 text-[14px]"
                onClick={() => {
                  openCreateGroupDialog();
                }}
              >
                สร้าง
              </ProTechButton>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="max-w-130 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#8B95A7]">กำลังโหลดข้อมูล...</p>
        ) : isGroupsTab ? (
          <ProTechTable
            columns={groupColumns}
            data={groupRows}
            limit={10}
            page={groupPage}
            totalPages={groupTotalPages}
            totalItems={groupTotalItems}
            onPageChange={setGroupPage}
          />
        ) : (
          <ProTechTable
            columns={memberColumns}
            data={memberRows}
            limit={10}
            page={memberPage}
            totalPages={memberTotalPages}
            totalItems={memberTotalItems}
            onPageChange={setMemberPage}
          />
        )}
      </div>

      {groupDialogState ? (
        <TeamGroupModal
          key={
            groupDialogState.mode === "edit" && groupDialogState.value.id
              ? `group-edit-${groupDialogState.value.id}`
              : "group-create"
          }
          open={groupDialogState !== null}
          saving={saving}
          mode={groupDialogState.mode}
          initialValue={groupDialogState.value}
          onOpenChange={(open) => {
            if (!open) {
              setGroupDialogState(null);
            }
          }}
          onSubmit={(value) => {
            void submitGroupDialog(value);
          }}
        />
      ) : null}

      {memberDialogState ? (
        <TeamMemberModal
          key={
            memberDialogState.mode === "edit" && memberDialogState.value.staffId
              ? `member-edit-${memberDialogState.value.staffId}`
              : "member-create"
          }
          open={memberDialogState !== null}
          saving={saving}
          mode={memberDialogState.mode}
          initialValue={memberDialogState.value}
          staffName={memberDialogState.staffName}
          staffOptions={staffOptions}
          teamOptions={activeTeamOptions}
          onOpenChange={(open) => {
            if (!open) {
              setMemberDialogState(null);
            }
          }}
          onSubmit={(value) => {
            void submitMemberDialog(value);
          }}
        />
      ) : null}
    </div>
  );
}
