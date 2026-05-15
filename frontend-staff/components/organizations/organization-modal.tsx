"use client";

import { useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import type { OrganizationPayload } from "@/hooks/organizations/use-organization-table";

type OrganizationModalProps = {
  open: boolean;
  saving: boolean;
  mode: "create" | "edit";
  initialValue: OrganizationPayload;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: OrganizationPayload) => void;
};

const TYPE_OPTIONS = [
  { label: "company", value: "company" },
  { label: "government", value: "government" },
  { label: "other", value: "other" },
];


const STATUS_OPTIONS = [
  { label: "active", value: "active" },
  { label: "inactive", value: "inactive" },
];

export function OrganizationModal({
  open,
  saving,
  mode,
  initialValue,
  onOpenChange,
  onSubmit,
}: OrganizationModalProps) {
  const [formState, setFormState] = useState<OrganizationPayload>(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <AdminModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setValidationError(null);
        }
        onOpenChange(nextOpen);
      }}
      title={mode === "edit" ? "แก้ไของค์กร" : "สร้างองค์กร"}
      widthClassName="max-w-[760px]"
    >
      <div className="px-4 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[16px] text-[#111827]">ชื่อองค์กร</label>
            <input
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">ประเภท</label>
            <select
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.type}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">สถานะ</label>
            <select
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.status}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">อีเมล</label>
            <input
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">เบอร์โทร</label>
            <input
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
          </div>
        </div>

        {validationError ? (
          <p className="mt-4 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
            {validationError}
          </p>
        ) : null}

        <div className="mt-10 flex justify-end gap-3">
          <ProTechButton
            variant="delete"
            className="h-8.25 min-w-19 text-[14px]"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </ProTechButton>
          <ProTechButton
            variant="primary"
            className="h-8.25 min-w-21.5 text-[14px]"
            disabled={saving}
            onClick={() => {
              const trimmedName = formState.name.trim();

              if (!trimmedName) {
                setValidationError("กรุณากรอกชื่อองค์กร");
                return;
              }

              setValidationError(null);
              onSubmit({
                ...formState,
                name: trimmedName,
              });
            }}
          >
            {saving ? "กำลังบันทึก..." : mode === "edit" ? "แก้ไข" : "ยืนยัน"}
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
  );
}
