"use client";

import { useEffect, useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  OrganizationFormInput,
  OrganizationStatus,
  OrganizationType,
} from "@/hooks/organizations/use-organization-table";
import {
  isValidOptionalEmail,
  isValidOptionalPhone,
  keepDigitsOnly,
  normalizeTextInput,
} from "@/lib/form-utils";

type OrganizationModalProps = {
  open: boolean;
  saving: boolean;
  mode: "create" | "edit";
  initialValue: OrganizationFormInput;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: OrganizationFormInput) => void;
};

const TYPE_OPTIONS: Array<{ label: string; value: OrganizationType }> = [
  { label: "company", value: "company" },
  { label: "government", value: "government" },
  { label: "other", value: "other" },
];

const STATUS_OPTIONS: Array<{ label: string; value: OrganizationStatus }> = [
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
  const [formState, setFormState] = useState<OrganizationFormInput>(initialValue);
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
      title={mode === "edit" ? "แก้ไของค์กร" : "สร้างองค์กร"}
      widthClassName="max-w-[760px]"
    >
      <div className="px-4 py-10">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">ชื่อองค์กร</label>
            <input
              type="text"
              autoComplete="organization"
              maxLength={150}
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.name}
              placeholder="กรอกชื่อองค์กร 
              "
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
            <Select
              value={formState.type}
              onValueChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  type: value as OrganizationType,
                }))
              }
            >
              <SelectTrigger className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
                  status: value as OrganizationStatus,
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

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">อีเมล</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={120}
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.email}
              placeholder="กรอก e-mail "
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
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.phone}
              placeholder="กรอกตัวเลข 0-9 เท่านั้น"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  phone: keepDigitsOnly(event.target.value),
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
            disabled={saving || !formState.name.trim()}
            onClick={() => {
              const trimmedName = normalizeTextInput(formState.name);
              const trimmedEmail = normalizeTextInput(formState.email);
              const trimmedPhone = normalizeTextInput(formState.phone);

              if (!trimmedName) {
                setValidationError("กรุณากรอกชื่อองค์กร");
                return;
              }

              if (!isValidOptionalEmail(trimmedEmail)) {
                setValidationError("กรุณากรอก e-mail ให้ถูกต้อง เช่น name@example.com");
                return;
              }

              if (!isValidOptionalPhone(trimmedPhone)) {
                setValidationError("กรุณากรอกเบอร์โทรเป็นตัวเลข 9-10 หลัก");
                return;
              }

              setValidationError(null);
              onSubmit({
                ...formState,
                name: trimmedName,
                email: trimmedEmail,
                phone: trimmedPhone,
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
