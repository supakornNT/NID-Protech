"use client";

import { useEffect, useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import type { UserGroupFormInput } from "@/hooks/user-groups/use-user-groups-page";
import { normalizeTextInput } from "@/lib/form-utils";

type TeamGroupModalProps = {
  open: boolean;
  saving: boolean;
  mode: "create" | "edit";
  initialValue: UserGroupFormInput;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: UserGroupFormInput) => void;
};

const STATUS_OPTIONS = [
  { value: "active", label: "ใช้งาน" },
  { value: "inactive", label: "ปิดใช้งาน" },
] as const;

export function TeamGroupModal({
  open,
  saving,
  mode,
  initialValue,
  onOpenChange,
  onSubmit,
}: TeamGroupModalProps) {
  const [formState, setFormState] = useState<UserGroupFormInput>(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(initialValue);
    setValidationError(null);
  }, [initialValue, open]);

  return (
    <AdminModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setValidationError(null);
        }

        onOpenChange(nextOpen);
      }}
      title={mode === "edit" ? "แก้ไขกลุ่มผู้ใช้งาน" : "สร้างกลุ่มผู้ใช้งาน"}
      widthClassName="max-w-[520px]"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-[16px] text-[#111827]">ชื่อกลุ่ม</label>
          <input
            type="text"
            autoComplete="off"
            maxLength={255}
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            className="h-8.5 w-full rounded-md border border-[#A8B1C2] bg-white px-3 text-[14px] text-[#111827] outline-none"
            placeholder="กรอกชื่อกลุ่ม"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#111827]">สถานะ</label>
          <select
            value={formState.status}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                status: event.target.value as UserGroupFormInput["status"],
              }))
            }
            className="h-8.5 w-full rounded-md border border-[#A8B1C2] bg-white px-3 text-[14px] text-[#111827] outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {validationError ? (
          <p className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
            {validationError}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-1">
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
              const normalizedName = normalizeTextInput(formState.name);

              if (!normalizedName) {
                setValidationError("กรุณากรอกชื่อกลุ่ม");
                return;
              }

              setValidationError(null);
              onSubmit({
                ...formState,
                name: normalizedName,
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
