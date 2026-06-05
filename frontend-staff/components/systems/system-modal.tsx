"use client";

import { useEffect, useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import type {
  SystemFormInput,
  SystemStatus,
} from "@/hooks/systems/use-system-type-table";
import { normalizeTextInput } from "@/lib/form-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrganizationOption = {
  id: number;
  name: string;
};

type SystemModalProps = {
  open: boolean;
  saving: boolean;
  mode: "create" | "edit";
  initialValue: SystemFormInput;
  organizationOptions: OrganizationOption[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: SystemFormInput) => void;
};

const STATUS_OPTIONS: Array<{ label: string; value: SystemStatus }> = [
  { label: "active", value: "active" },
  { label: "inactive", value: "inactive" },
];

export function SystemModal({
  open,
  saving,
  mode,
  initialValue,
  organizationOptions,
  onOpenChange,
  onSubmit,
}: SystemModalProps) {
  const [formState, setFormState] = useState<SystemFormInput>(initialValue);
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
      title={mode === "edit" ? "แก้ไขข้อมูลระบบ" : "สร้างข้อมูลระบบ"}
      widthClassName="max-w-[720px]"
    >
      <div className="px-4 py-10">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">ชื่อระบบ</label>
            <input
              type="text"
              maxLength={255}
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.name}
              placeholder="กรอกชื่อระบบ"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">องค์กร</label>
            <Select
              value={formState.organizationId ? String(formState.organizationId) : ""}
              onValueChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  organizationId: value ? Number(value) : null,
                }))
              }
            >
              <SelectTrigger className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none">
                <SelectValue placeholder="เลือกองค์กร" />
              </SelectTrigger>
              <SelectContent>
                {organizationOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">สถานะ</label>
            <Select
              value={formState.status}
              onValueChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  status: value as SystemStatus,
                }))
              }
            >
              <SelectTrigger className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {validationError ? (
          <p className="mt-4 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
            {validationError}
          </p>
        ) : null}

        <div className="mt-10 flex w-full justify-end gap-3">
          <ProTechButton
            variant="delete"
            className="h-8.25 flex-1 min-w-0 sm:flex-none sm:min-w-19 text-[14px]"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </ProTechButton>
          <ProTechButton
            variant="primary"
            className="h-8.25 flex-1 min-w-0 sm:flex-none sm:min-w-21.5 text-[14px]"
            disabled={saving || !formState.name.trim() || !formState.organizationId}
            onClick={() => {
              const trimmedName = normalizeTextInput(formState.name);

              if (!trimmedName) {
                setValidationError("กรุณากรอกชื่อระบบ");
                return;
              }

              if (!formState.organizationId) {
                setValidationError("กรุณาเลือกองค์กร");
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
