"use client";

import {  useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { normalizeTextInput } from "@/lib/form-utils";
import { EditDialogState, PermissionSection } from "@/hooks/permission/useTeamPermissionsPage";



function getSectionDisplayTitle(sectionId: string, fallbackTitle: string) {
  if (sectionId === "screening") return "รับเรื่องและคัดกรอง";
  if (sectionId === "reports") return "รายงาน";
  if (sectionId === "tracking") return "การติดตาม";
  if (sectionId === "operation") return "การปฏิบัติงาน";
  if (sectionId === "assignment") return "การพิจารณา";
  if (sectionId === "management") return "การจัดการ";

  return fallbackTitle;
}

function getSectionItemContainerClassName(sectionId: string) {
  if (sectionId === "management") {
    return "grid gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-4";
  }

  if (sectionId === "assignment") {
    return "grid gap-x-5 gap-y-4 lg:grid-cols-2";
  }

  return "space-y-3";
}

function getSectionCardClassName(sectionId: string) {
  if (sectionId === "management") {
    return "min-h-[136px]";
  }

  if (sectionId === "assignment") {
    return "min-h-[138px]";
  }

  return "min-h-[138px]";
}

type PermissionEditModalProps = {
  open: boolean;
  loading: boolean;
  saving: boolean;
  value: EditDialogState;
  onOpenChange: (open: boolean) => void;
  onChange: (value: EditDialogState) => void;
  onSubmit: (value: NonNullable<EditDialogState>) => void;
};

export function PermissionEditModal({
  open,
  loading,
  saving,
  value,
  onOpenChange,
  onChange,
  onSubmit,
}: PermissionEditModalProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  function closeModal() {
  setValidationError(null);
  onOpenChange(false);
}
  function togglePermission(permissionId: number) {
    if (!value) {
      return;
    }

    const nextPermissionIds = value.permissionIds.includes(permissionId)
      ? value.permissionIds.filter(
          (currentPermissionId) => currentPermissionId !== permissionId,
        )
      : [...value.permissionIds, permissionId];

    onChange({
      ...value,
      permissionIds: nextPermissionIds,
    });
  }

  const sectionsForDisplay = value
    ? value.sections.reduce<PermissionSection[]>((result, section) => {
        if (section.id === "other") {
          const reportsSection = result.find(
            (currentSection) => currentSection.id === "reports",
          );

          if (reportsSection) {
            reportsSection.items = [...reportsSection.items, ...section.items];
            return result;
          }
        }

        result.push(section);
        return result;
      }, [])
    : [];

  return (
    <AdminModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="แก้ไขข้อมูลสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม"
      widthClassName="max-w-none sm:max-w-none"
      contentClassName="top-8 translate-y-0"
      contentStyle={{ width: "min(980px, calc(100vw - 2rem))" }}
      bodyClassName="px-4 py-6 sm:px-5 sm:py-7"
      headerClassName="mb-5 text-center"
      titleClassName="text-[18px] font-bold normal-case tracking-normal text-[#3F73BB] sm:text-[20px]"
    >
      {loading ? (
        <p className="text-sm text-[#8B95A7]">กำลังโหลดรายละเอียดสิทธิ์...</p>
      ) : value ? (
        <div className="max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto pr-1">
          <div className="max-w-70 space-y-1.5">
            <label className="block text-[16px] text-[#111827]">ทีม</label>

            <input
              type="text"
              autoComplete="off"
              maxLength={255}
              value={value.teamName}
              onChange={(event) =>
                onChange({
                  ...value,
                  teamName: event.target.value,
                })
              }
              className="h-8 w-full rounded-[6px] border border-[#A8B1C2] bg-white px-3 text-[13px] text-[#111827] outline-none"
              placeholder="กรอกชื่อทีม เช่น ทีม IT Support"
            />
          </div>

          <div className="rounded-[6px] border border-[#A8B1C2] bg-[#EEF4FF] p-3 sm:p-4">
            <p className="mb-3 text-[15px] font-semibold text-[#111827]">
              จัดการสิทธิ์
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectionsForDisplay.map((section) => (
                <div
                  key={section.id}
                  className={`rounded-[6px] border border-[#A8B1C2] bg-white p-3 ${getSectionCardClassName(
                    section.id,
                  )} ${section.className ?? ""}`}
                >
                  <p className="mb-3 text-[13px] font-medium text-[#111827]">
                    {getSectionDisplayTitle(section.id, section.title)}
                  </p>

                  <div className={getSectionItemContainerClassName(section.id)}>
                    {section.items.map((item) => (
                      <PermissionChoice
                        key={item.id}
                        checked={value.permissionIds.includes(item.id)}
                        label={item.name}
                        onToggle={() => {
                          togglePermission(item.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {validationError ? (
            <p className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
              {validationError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <ProTechButton
              variant="delete"
              className="h-8 min-w-18 text-[12px]"
             onClick={closeModal}
            >
              ยกเลิก
            </ProTechButton>

            <ProTechButton
              variant="primary"
              className="h-8 min-w-18 text-[12px]"
              disabled={saving}
              onClick={() => {
                const normalizedTeamName = normalizeTextInput(value.teamName);

                if (!normalizedTeamName) {
                  setValidationError("กรุณากรอกชื่อทีม");
                  return;
                }

                if (value.permissionIds.length === 0) {
                  setValidationError("กรุณาเลือกสิทธิ์อย่างน้อย 1 รายการ");
                  return;
                }

                setValidationError(null);

                const nextValue: NonNullable<EditDialogState> = {
                  ...value,
                  teamName: normalizedTeamName,
                };

                onChange(nextValue);
                onSubmit(nextValue);
              }}
            >
              {saving ? "กำลังบันทึก..." : "เพิ่มสิทธิ์"}
            </ProTechButton>
          </div>
        </div>
      ) : null}
    </AdminModalShell>
  );
}

function PermissionChoice({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-2.5 text-left text-[12px] leading-5 text-[#111827]"
    >
      <span
        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
          checked
            ? "border-[#3F73BB] bg-[#3F73BB]"
            : "border-[#111827] bg-white"
        }`}
      >
        {checked ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>

      <span>{label}</span>
    </button>
  );
}