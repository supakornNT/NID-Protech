"use client";

import { useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import type {
  ProblemTypePayload,
  ProblemTypeRequestType,
  ProblemTypeStatus,
} from "@/hooks/problem-types/use-problem-type-table";
import { normalizeTextInput } from "@/lib/form-utils";

type ProblemTypeModalProps = {
  open: boolean;
  saving: boolean;
  mode: "create" | "edit";
  initialValue: ProblemTypePayload;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ProblemTypePayload) => void;
};

const REQUEST_TYPE_OPTIONS: Array<{
  label: string;
  value: ProblemTypeRequestType;
}> = [
  { label: "ปัญหา", value: "issue" },
  { label: "ข้อร้องเรียน", value: "complaint" },
];

const STATUS_OPTIONS: Array<{ label: string; value: ProblemTypeStatus }> = [
  { label: "ใช้งาน", value: "active" },
  { label: "ปิดใช้งาน", value: "inactive" },
];

export function ProblemTypeModal({
  open,
  saving,
  mode,
  initialValue,
  onOpenChange,
  onSubmit,
}: ProblemTypeModalProps) {
  const [formState, setFormState] = useState<ProblemTypePayload>(initialValue);
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
      title={
        mode === "edit"
          ? "แก้ไขรูปแบบปัญหาและข้อร้องเรียน"
          : "สร้างรูปแบบปัญหาและข้อร้องเรียน"
      }
      widthClassName="max-w-[920px]"
    >
      <div className="rounded-[50px] px-4 py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">รหัส</label>
            <input
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-[#F8FAFC] px-3 text-[#64748B] outline-none"
              value={formState.code || ""}
              placeholder={mode === "create" ? "ระบบจะสร้างรหัสอัตโนมัติ" : ""}
              disabled
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">หมวด</label>
            <select
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.requestType}
              disabled={mode === "edit"}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  requestType: event.target.value as ProblemTypeRequestType,
                }))
              }
            >
              {REQUEST_TYPE_OPTIONS.map((option) => (
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
                  status: event.target.value as ProblemTypeStatus,
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

          <div className="space-y-2 md:col-span-3">
            <label className="block text-[16px] text-[#111827]">ประเภท</label>
            <input
              type="text"
              autoComplete="off"
              maxLength={100}
              className="h-8.25 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              value={formState.name}
              placeholder="กรอกชื่อประเภท เช่น ปัญหาระบบ, ขอแก้ไขข้อมูล"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
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

        <div className="mt-16 flex justify-end gap-3">
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
              const trimmedName = normalizeTextInput(formState.name);

              if (!trimmedName) {
                setValidationError("กรุณากรอกชื่อประเภท");
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
