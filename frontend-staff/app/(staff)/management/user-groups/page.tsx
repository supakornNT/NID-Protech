"use client";

import { useMemo, useState } from "react";
import type { Column } from "@/types/table";
import {
  ActionIcons,
  CheckCell,
  PermissionTags,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { permissionRows, userGroupRows } from "@/lib/admin-mocks";

type TabKey = "groups" | "members";
type GroupRow = (typeof userGroupRows)[number];
type MemberRow = (typeof permissionRows)[number];

export default function UserGroupsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabKey>("groups");
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedGroupRows, setSelectedGroupRows] = useState<number[]>([]);
  const [selectedMemberRows, setSelectedMemberRows] = useState<number[]>([]);

  const allGroupSelected = selectedGroupRows.length === userGroupRows.length;
  const allMemberSelected = selectedMemberRows.length === permissionRows.length;

  const groupColumns: Column<GroupRow>[] = useMemo(
    () => [
      {
        key: "check",
        title: "",
        className: "w-[150px]",
        render: (_, row) => (
          <CheckCell
            checked={selectedGroupRows.includes(row.order)}
            onClick={() => {
              setSelectedGroupRows((current) =>
                current.includes(row.order)
                  ? current.filter((item) => item !== row.order)
                  : [...current, row.order],
              );
            }}
          />
        ),
      },
      { key: "order", title: "ลำดับ" },
      { key: "groupName", title: "กลุ่ม" },
      {
        key: "status",
        title: "สถานะ",
        render: (value) => <StatusBadge label={String(value)} tone="success" />,
      },
      {
        key: "actions",
        title: "จัดการ",
        render: (_, row) => <GroupActionCell row={row} />,
      },
    ],
    [allGroupSelected, selectedGroupRows],
  );

  const memberColumns: Column<MemberRow>[] = useMemo(
    () => [
      {
        key: "check",
        title: (
          <CheckCell
            checked={allMemberSelected}
            onClick={() =>
              setSelectedMemberRows(
                allMemberSelected ? [] : permissionRows.map((row) => row.order),
              )
            }
          />
        ),
        className: "w-[72px]",
        render: (_, row) => (
          <CheckCell
            checked={selectedMemberRows.includes(row.order)}
            onClick={() => {
              setSelectedMemberRows((current) =>
                current.includes(row.order)
                  ? current.filter((item) => item !== row.order)
                  : [...current, row.order],
              );
            }}
          />
        ),
      },
      { key: "order", title: "ลำดับ" },
      { key: "fullName", title: "ชื่อ-นามสกุล" },
      {
        key: "permissions",
        title: "กลุ่ม",
        render: (_, row) => (
          <PermissionTags
            items={row.permissions.map((item) => item.replace("ITA", "IT"))}
          />
        ),
      },
      {
        key: "status",
        title: "สถานะ",
        render: (value) => {
          const status = String(value);

          if (status === "active") {
            return <StatusBadge label="ใช้งาน" tone="success" />;
          }

          if (status === "inactive") {
            return <StatusBadge label="ปิดใช้งาน" tone="danger" />;
          }

          return <StatusBadge label={status} tone="neutral" />;
        },
      },
      {
        key: "actions",
        title: "จัดการ",
        render: (_, row) => <MemberActionCell row={row} />,
      },
    ],
    [allMemberSelected, selectedMemberRows],
  );

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          จัดการกลุ่มผู้ใช้งาน
        </h1>
        <p className="mt-2 text-[16px] text-[#8B95A7]">
          การจัดการแก้ไขข้อมูลกลุ่มผู้ใช้งาน
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ProTechSearch
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder=""
          className="w-55.5 flex-none"
          inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
        />
        <ProTechButton
          variant="primary"
          className="h-7.75 min-w-18.5 px-4 text-[14px]"
        >
          ค้นหา
        </ProTechButton>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="relative inline-flex items-end gap-8 px-3 pb-2">
          <span className="absolute inset-x-0 bottom-0 h-px bg-[#111827]" />
         
        </div>

        <div className="flex items-center gap-3">
          <ToolbarSelect placeholder="กลุ่มทั้งหมด" />
          <ToolbarSelect placeholder="สถานะทั้งหมด" />
          <ProTechButton variant="delete" className="h-7.75 px-4 text-[14px]">
            ลบ
          </ProTechButton>
          <ProTechButton
            variant="create"
            className="h-7.75 px-4 text-[14px]"
            onClick={() => setOpenCreate(true)}
          >
            สร้าง
          </ProTechButton>
        </div>
      </div>

      {tab === "groups" ? (
        <ProTechTable
          columns={groupColumns}
          data={userGroupRows}
          page={1}
          totalPages={3}
          totalItems={4}
          onPageChange={() => {}}
        />
      ) : (
        <ProTechTable
          columns={memberColumns}
          data={permissionRows}
          page={1}
          totalPages={3}
          totalItems={4}
          onPageChange={() => {}}
        />
      )}

      <CreateGroupModal open={openCreate} onOpenChange={setOpenCreate} />
      </div>
    </div>
  );
}

function GroupActionCell({ row }: { row: GroupRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionIcons showInfo={false} onEdit={() => setOpen(true)} />
      <AdminModalShell
        open={open}
        onOpenChange={setOpen}
        title="แก้ไขข้อมูลกลุ่มผู้ใช้งาน"
        widthClassName="max-w-[382px]"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <Field value={row.groupName} label=" " />
            <SelectField label="สถานะ" value="ใช้งาน" />
          </div>
          <div className="flex justify-end gap-3">
            <ProTechButton
              variant="delete"
              className="h-8.25 min-w-19 text-[14px]"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-8.25 min-w-21.5 text-[14px]"
            >
              แก้ไข
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </>
  );
}

function MemberActionCell({ row }: { row: MemberRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionIcons showInfo={false} onEdit={() => setOpen(true)} />
      <AdminModalShell
        open={open}
        onOpenChange={setOpen}
        title="แก้ไขข้อมูลกลุ่มผู้ใช้งาน"
        widthClassName="max-w-[372px]"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <Field value={String(row.fullName)} label="ชื่อ-นามสกุล" />
            <SelectField label="สถานะ" value="ใช้งาน" />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[14px] text-[#111827]">กลุ่ม</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3F73BB] text-white">
                +
              </span>
            </div>
            <div className="flex flex-wrap gap-5">
              {["support", "network", "IT"].map((item) => (
                <div key={item} className="flex items-center gap-1">
                  <div className="flex h-[33px] min-w-[112px] items-center justify-center rounded-md border border-[#A8B1C2] bg-white px-3 text-[14px] text-[#111827]">
                    {item}
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B55E5E] text-xs text-white">
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <ProTechButton
              variant="delete"
              className="h-[33px] min-w-[76px] text-[14px]"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-[33px] min-w-[86px] text-[14px]"
            >
              แก้ไข
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </>
  );
}

function CreateGroupModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AdminModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="สร้างข้อมูลกลุ่มผู้ใช้งาน"
      widthClassName="max-w-[372px]"
    >
      <div className="space-y-7">
        <div className="flex justify-center">
          <div className="h-[33px] w-[224px] rounded-md border border-[#A8B1C2] bg-white" />
        </div>
        <div className="flex justify-end gap-3">
          <ProTechButton
            variant="delete"
            className="h-[33px] min-w-[76px] text-[14px]"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </ProTechButton>
          <ProTechButton
            variant="primary"
            className="h-[33px] min-w-[86px] text-[14px]"
          >
            ยืนยัน
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[14px] text-[#111827]">{label}</label>
      <div className="flex h-[33px] items-center rounded-md border border-[#A8B1C2] bg-white px-3 text-[14px] text-[#111827]">
        {value}
      </div>
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[14px] text-[#111827]">{label}</label>
      <div className="flex h-[33px] items-center justify-between rounded-md border border-[#A8B1C2] bg-white px-3 text-[14px] text-[#111827]">
        <span>{value}</span>
        <span>⌄</span>
      </div>
    </div>
  );
}

function ToolbarSelect({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex h-[31px] min-w-[132px] items-center justify-between rounded-md border border-[#A8B1C2] bg-white px-4 text-[14px] text-[#6B7280]">
      <span>{placeholder}</span>
      <span>⌄</span>
    </div>
  );
}
