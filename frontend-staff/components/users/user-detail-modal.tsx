"use client";

import { useEffect, useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { keepDigitsOnly } from "@/lib/form-utils";
import type {
  UserFormInput,
  UserListApiItem,
} from "@/hooks/users/use-users-management";
import {
  normalizeUserFormInput,
  validateUserFormInput,
} from "@/hooks/users/use-users-management";
import { formatCitizenId, formatPhoneNumber } from "@/lib/utils";
import { formatThaiDateTime } from "@/app/(staff)/management/organizations/page";

type UserDetailModalProps = {
  open: boolean;
  saving: boolean;
  user: UserListApiItem | null;
  prefixOptions: Array<{ value: number; label: string }>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: UserFormInput) => void;
};

function buildInitialValue(user: UserListApiItem | null): UserFormInput {
  return {
    userType: user?.userType ?? "staff",
    prefixId: user?.prefixId ?? null,
    name: user?.name ?? "",
    surname: user?.surname ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    citizenId: user?.citizenId ?? "",
    status: user?.status ?? "active",
  };
}

function EditableRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 rounded-xl bg-[#F8FAFC] px-4 py-3 sm:grid-cols-[160px_1fr] sm:items-center">
      <p className="text-sm font-semibold text-[#475569]">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ReadonlyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 rounded-xl bg-[#F8FAFC] px-4 py-3 sm:grid-cols-[160px_1fr] sm:items-start">
      <p className="text-sm font-semibold text-[#475569]">{label}</p>
      <div className="min-w-0 text-sm text-[#111827]">{value}</div>
    </div>
  );
}

function formatPhoneInputValue(value: string) {
  const formatted = formatPhoneNumber(value);
  return formatted === "-" ? "" : formatted;
}

function formatCitizenIdInputValue(value: string) {
  const formatted = formatCitizenId(value);
  return formatted === "-" ? "" : formatted;
}

export function UserDetailModal({
  open,
  saving,
  user,
  prefixOptions,
  onOpenChange,
  onSubmit,
}: UserDetailModalProps) {
  const [formState, setFormState] = useState<UserFormInput>(
    buildInitialValue(user),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(buildInitialValue(user));
    setValidationError(null);
  }, [open, user]);

  return (
    <AdminModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setValidationError(null);
        }
        onOpenChange(nextOpen);
      }}
      title="รายละเอียดผู้ใช้งาน"
      widthClassName="max-w-[760px]"
    >
      <div className="space-y-3">
        <EditableRow label="คำนำหน้า">
          <select
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            value={formState.prefixId ?? ""}
            onChange={(event) => {
              const nextValue = event.target.value;
              setFormState((current) => ({
                ...current,
                prefixId: nextValue ? Number(nextValue) : null,
              }));
            }}
          >
            <option value="">-</option>
            {prefixOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </EditableRow>

        <EditableRow label="ชื่อ">
          <input
            type="text"
            maxLength={255}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            value={formState.name}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }));
            }}
          />
        </EditableRow>

        <EditableRow label="นามสกุล">
          <input
            type="text"
            maxLength={255}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            value={formState.surname}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                surname: event.target.value,
              }));
            }}
          />
        </EditableRow>

        <EditableRow label="อีเมล">
          <input
            type="email"
            maxLength={255}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            value={formState.email}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }));
            }}
          />
        </EditableRow>

        <EditableRow label="เบอร์โทร">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={12}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            value={formatPhoneInputValue(formState.phone)}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                phone: keepDigitsOnly(event.target.value).slice(0, 10),
              }));
            }}
          />
        </EditableRow>

        <EditableRow label="เลขบัตรประชาชน">
          <input
            type="text"
            inputMode="numeric"
            maxLength={17}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            value={formatCitizenIdInputValue(formState.citizenId)}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                citizenId: keepDigitsOnly(event.target.value).slice(0, 13),
              }));
            }}
          />
        </EditableRow>

        <EditableRow label="สถานะ">
          <select
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            value={formState.status}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                status: event.target.value,
              }));
            }}
          >
            {formState.userType === "customer" ? (
              <>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="pending">รออนุมัติ</option>
                <option value="rejected">ปฏิเสธ</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </>
            ) : (
              <>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </>
            )}
          </select>
        </EditableRow>

        <ReadonlyRow
          label="ประเภทผู้ใช้"
          value={user?.userType === "customer" ? "ลูกค้า" : "เจ้าหน้าที่"}
        />

        {user?.userType === "customer" ? (
          <>
            <ReadonlyRow
              label="ประเภทลูกค้า"
              value={user.customerType || "-"}
            />
            <ReadonlyRow
              label="องค์กร"
              value={user.organizationName || "-"}
            />
          </>
        ) : null}

        <ReadonlyRow
          label="วันที่สร้าง"
          value={formatThaiDateTime(user?.createdAt ?? null)}
        />
        <ReadonlyRow
          label="วันที่แก้ไข"
          value={formatThaiDateTime(user?.updatedAt ?? null)}
        />
        <ReadonlyRow
          label="เปลี่ยนรหัสผ่านล่าสุด"
          value={formatThaiDateTime(user?.lastPasswordChangedAt ?? null)}
        />

        {validationError ? (
          <p className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
            {validationError}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <ProTechButton
            variant="delete"
            className="h-10 min-w-[88px]"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            ยกเลิก
          </ProTechButton>
          <ProTechButton
            variant="primary"
            className="h-10 min-w-[110px]"
            disabled={saving}
            onClick={() => {
              const normalized = normalizeUserFormInput(formState);
              const message = validateUserFormInput(normalized);

              if (message) {
                setValidationError(message);
                return;
              }

              setValidationError(null);
              onSubmit(normalized);
            }}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
  );
}
