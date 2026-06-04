"use client";

import { useMemo, useState } from "react";

import {
  ActionIcons,
  CheckCell,
  PermissionTags,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import {
  ActionSuccessModal,
  type ManagementSuccessAction,
} from "@/components/admin/action-success-modal";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { TeamGroupModal } from "@/components/user-groups/team-group-modal";
import { TeamMemberModal } from "@/components/user-groups/team-member-modal";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearchBar } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { ToolbarSelect } from "@/components/ui/toolbar-select";
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

type SuccessState = {
  action: ManagementSuccessAction;
  subject: string;
} | null;

export default function UserGroupsPage() {
  const [successState, setSuccessState] = useState<SuccessState>(null);
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
        className: "w-[72px] text-lg font-medium",
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
      { key: "groupName", title: "กลุ่ม", className: "w-[220px] text-lg font-medium" },

      {
        key: "memberCount",
        title: "จำนวนสมาชิก",
        className: "w-[140px] text-lg font-medium",
      },
      {
        key: "status",
        title: "สถานะ",
        className: "w-[140px] text-lg font-medium",
        render: (value) => renderStatus(String(value)),
      },
      {
        key: "createdAt",
        title: "วันที่สร้าง",
        className: "w-[180px] text-lg font-medium",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "updatedAt",
        title: "วันที่แก้ไข",
        className: "w-[180px] text-lg font-medium",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "actions",
        title: "จัดการ",
        className: "w-[120px] text-lg font-medium",
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
      { key: "order", title: "ลำดับ", className: "w-[100px] text-lg font-medium" },
      { key: "fullName", title: "ชื่อ-นามสกุล", className: "w-[220px] text-lg font-medium" },
      { key: "email", title: "อีเมล", className: "w-[220px] text-lg font-medium" },
      {
        key: "status",
        title: "สถานะ",
        className: "w-[140px] text-lg font-medium",
        render: (value) => renderStatus(String(value)),
      },
      {
        key: "teams",
        title: "กลุ่ม",
        className: "w-[260px] text-lg font-medium",
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
        className: "w-[180px] text-lg font-medium",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "updatedAt",
        title: "วันที่แก้ไข",
        className: "w-[180px] text-lg font-medium",
        render: (value) => formatThaiDateTime((value as string | null) ?? null),
      },
      {
        key: "actions",
        title: "จัดการ",
        className: "w-[120px] text-lg font-medium",
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
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#3F73BB]" />
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
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#3F73BB]" />
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
                options={[
                  { value: "all", label: "สถานะทั้งหมด" },
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
                  options={[
                    { value: "all", label: "ทีมทั้งหมด" },
                    ...activeTeamOptions.map((team) => ({
                      value: String(team.value),
                      label: team.label,
                    })),
                  ]}
                  onChange={(value) => {
                    setTeamFilter(value === "all" ? "all" : Number(value));
                    setMemberPage(1);
                  }}
                />
                <ToolbarSelect
                  value={memberGroupFilter}
                  options={[
                    { value: "all", label: "สถานะกลุ่มทั้งหมด" },
                    { value: "with-group", label: "มีกลุ่ม" },
                    { value: "without-group", label: "ไม่มีกลุ่ม" },
                  ]}
                  className="min-w-[168px]"
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
                  void (async () => {
                    const success = await deleteSelectedGroup();

                    if (success) {
                      setSuccessState({
                        action: "delete",
                        subject: "ข้อมูลกลุ่มผู้ใช้งาน",
                      });
                    }
                  })();
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

        {isGroupsTab ? (
          <ProTechTable
            columns={groupColumns}
            data={groupRows}
            limit={10}
            page={groupPage}
            totalPages={groupTotalPages}
            totalItems={groupTotalItems}
            onPageChange={setGroupPage}
            loading={loading}
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
            loading={loading}
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
            void (async () => {
              const success = await submitGroupDialog(value);

              if (success) {
                setSuccessState({
                  action: groupDialogState.mode === "edit" ? "update" : "create",
                  subject: "ข้อมูลกลุ่มผู้ใช้งาน",
                });
              }
            })();
          }}
        />
      ) : null}

      {memberDialogState ? (
        <TeamMemberModal
          key={
            memberDialogState.value.staffId
              ? `member-edit-${memberDialogState.value.staffId}`
              : "member-edit"
          }
          open={memberDialogState !== null}
          saving={saving}
          initialValue={memberDialogState.value}
          staffName={memberDialogState.staffName}
          teamOptions={activeTeamOptions}
          onOpenChange={(open) => {
            if (!open) {
              setMemberDialogState(null);
            }
          }}
          onSubmit={(value) => {
            void (async () => {
              const success = await submitMemberDialog(value);

              if (success) {
                setSuccessState({
                  action: "update",
                  subject: "ข้อมูลสมาชิกกลุ่ม",
                });
              }
            })();
          }}
        />
      ) : null}

      <ActionSuccessModal
        open={successState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessState(null);
          }
        }}
        action={successState?.action ?? "create"}
        subject={successState?.subject}
      />
    </div>
  );
}
