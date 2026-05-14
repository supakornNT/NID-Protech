"use client";

import { useState } from "react";
import type { Column } from "@/types/table";
import {
  ActionIcons,
  CheckCell,
} from "@/components/admin/admin-table-page";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { problemTypeRows } from "@/lib/admin-mocks";

type ProblemTypeRow = (typeof problemTypeRows)[number];

const columns: Column<ProblemTypeRow>[] = [
  { key: "check", title: "", render: () => <CheckCell /> },
  { key: "order", title: "ลำดับ" },
  { key: "category", title: "หมวด" },
  { key: "type", title: "ประเภท" },
  {
    key: "actions",
    title: "จัดการ",
    render: (_, row) => <ProblemTypeActionCell row={row} />,
  },
];

export default function ProblemTypesPage() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          จัดการรูปแบบประเด็นและคำร้อง
        </h1>
        <p className="mt-2 text-[16px] text-[#8B95A7]">จัดการข้อมูลรูปแบบประเด็น/คำร้อง</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ProTechSearch
            value=""
            onChange={() => {}}
            placeholder=""
            className="w-[222px] flex-none"
            inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
          />
          <ProTechButton variant="primary" className="h-[31px] min-w-[74px] px-4 text-[14px]">
            ค้นหา
          </ProTechButton>
          <ToolbarSelect placeholder="หมวดทั้งหมด" />
        </div>
        <div className="flex items-center gap-3">
          <ProTechButton variant="delete" className="h-[31px] px-4 text-[14px]">
            ลบ
          </ProTechButton>
          <ProTechButton
            variant="create"
            className="h-[31px] px-4 text-[14px]"
            onClick={() => setOpenCreate(true)}
          >
            สร้าง
          </ProTechButton>
        </div>
      </div>

      <ProTechTable
        columns={columns}
        data={problemTypeRows}
        page={2}
        totalPages={3}
        totalItems={50}
        onPageChange={() => {}}
      />

      <ProblemTypeModal open={openCreate} onOpenChange={setOpenCreate} title="จัดการรูปแบบประเด็นและคำร้อง" actionLabel="ยืนยัน" />
      </div>
    </div>
  );
}

function ProblemTypeActionCell({ row }: { row: ProblemTypeRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionIcons showInfo={false} onEdit={() => setOpen(true)} />
      <ProblemTypeModal
        open={open}
        onOpenChange={setOpen}
        title="จัดการรูปแบบประเด็นและคำร้อง"
        actionLabel="แก้ไข"
        defaultCategory={row.category}
        defaultType={row.type}
      />
    </>
  );
}

function ProblemTypeModal({
  open,
  onOpenChange,
  title,
  actionLabel,
  defaultCategory = "",
  defaultType = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  actionLabel: string;
  defaultCategory?: string;
  defaultType?: string;
}) {
  return (
    <AdminModalShell open={open} onOpenChange={onOpenChange} title={title} widthClassName="max-w-[720px]">
      <div className="rounded-[28px] bg-[#EAF1FC] px-14 py-14">
        <div className="grid grid-cols-2 gap-18">
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">หมวด</label>
            <select className="h-[33px] w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none" defaultValue={defaultCategory}>
              <option value=""></option>
              <option value="ประเด็น">ประเด็น</option>
              <option value="คำร้อง">คำร้อง</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">ประเภท</label>
            <input className="h-[33px] w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none" defaultValue={defaultType} />
          </div>
        </div>

        <div className="mt-16 flex justify-end gap-3">
          <ProTechButton variant="delete" className="h-[33px] min-w-[76px] text-[14px]" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </ProTechButton>
          <ProTechButton variant="primary" className="h-[33px] min-w-[86px] text-[14px]">
            {actionLabel}
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
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
