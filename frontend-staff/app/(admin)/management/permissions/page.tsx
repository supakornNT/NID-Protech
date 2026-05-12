"use client";

import { useState } from "react";
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
import { permissionRows } from "@/lib/admin-mocks";

type PermissionRow = (typeof permissionRows)[number];

const columns: Column<PermissionRow>[] = [
  { key: "check", title: "", render: () => <CheckCell /> },
  { key: "order", title: "ลำดับ" },
  { key: "fullName", title: "ชื่อ-นามสกุล" },
  {
    key: "permissions",
    title: "กลุ่ม-สิทธิ์",
    render: (_, row) => <PermissionTags items={row.permissions} />,
  },
  {
    key: "status",
    title: "สถานะ",
    render: (value) => <StatusBadge label={String(value)} tone="success" />,
  },
  {
    key: "actions",
    title: "จัดการ",
    render: (_, row) => <PermissionActionCell row={row} />,
  },
];

export default function PermissionsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          จัดการสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม
        </h1>
        <p className="mt-2 text-[16px] text-[#8B95A7]">การจัดการแก้ไขสิทธิ์ผู้ใช้งาน</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ProTechSearch
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder=""
            className="w-[222px] flex-none"
            inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
          />
          <ProTechButton variant="primary" className="h-[31px] min-w-[74px] px-4 text-[14px]">
            ค้นหา
          </ProTechButton>
          <ToolbarSelect placeholder="กลุ่มทั้งหมด" />
          <ToolbarSelect placeholder="สิทธิ์ทั้งหมด" />
          <ToolbarSelect placeholder="สถานะทั้งหมด" />
        </div>

        <ProTechButton variant="delete" className="h-[31px] px-4 text-[14px]">
          ลบ
        </ProTechButton>
      </div>

      <ProTechTable
        columns={columns}
        data={permissionRows}
        page={1}
        totalPages={3}
        totalItems={permissionRows.length}
        onPageChange={() => {}}
      />
    </div>
  );
}

function PermissionActionCell({ row }: { row: PermissionRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionIcons showInfo={false} onEdit={() => setOpen(true)} />
      <AdminModalShell
        open={open}
        onOpenChange={setOpen}
        title="แก้ไขข้อมูลกลุ่มผู้ใช้งาน"
        widthClassName="max-w-[516px]"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-[1fr_110px] gap-4">
            <Field label="ชื่อ-นามสกุล" value={String(row.fullName)} />
            <SelectField label="สถานะ" value="ใช้งาน" />
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-5">
            <div>
              <p className="mb-3 text-[16px] font-semibold text-[#3F73BB]">กลุ่ม</p>
              <div className="space-y-5 pt-2 text-[14px] text-[#111827]">
                <p>network</p>
                <p>IT</p>
                <p>Support</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-center text-[16px] font-semibold text-[#3F73BB]">สิทธิ์</p>
              <div className="space-y-5">
                <PermissionRadioRow selected="operator" />
                <PermissionRadioRow selected="screening" />
                <PermissionRadioRow selected="screening" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <ProTechButton
              variant="delete"
              className="h-[33px] min-w-[76px] text-[14px]"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton variant="primary" className="h-[33px] min-w-[86px] text-[14px]">
              แก้ไข
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </>
  );
}

function PermissionRadioRow({ selected }: { selected: "screening" | "assign" | "operator" }) {
  return (
    <div className="grid grid-cols-3 gap-4 text-[14px] text-[#111827]">
      <RadioLike checked={selected === "screening"} label="Screening" />
      <RadioLike checked={selected === "assign"} label="Assign" />
      <RadioLike checked={selected === "operator"} label="Operator" />
    </div>
  );
}

function RadioLike({ checked, label }: { checked: boolean; label: string }) {
  return (
    <label className="flex items-center gap-3">
      <span
        className={`h-5 w-5 rounded-full border ${checked ? "border-[#3F73BB] bg-[#3F73BB]" : "border-[#111827] bg-white"}`}
      />
      {label}
    </label>
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
