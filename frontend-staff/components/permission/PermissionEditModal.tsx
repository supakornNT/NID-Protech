"use client";

import { useEffect, useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import {
  STAFF_SECTION_KEY_BY_PERMISSION_PREFIX,
  STAFF_SECTION_LABELS,
} from "@/components/sidebar/staff-navigation";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  PermissionEditDialogValue,
  PermissionSectionApiItem,
} from "@/hooks/permission/useTeamPermissionsPage";

function getSectionDisplayTitle(sectionId: string, fallbackTitle: string) {
  if (sectionId in STAFF_SECTION_LABELS) {
    return STAFF_SECTION_LABELS[sectionId as keyof typeof STAFF_SECTION_LABELS];
  }

  const normalizedSectionId = STAFF_SECTION_KEY_BY_PERMISSION_PREFIX[sectionId];

  if (normalizedSectionId && normalizedSectionId in STAFF_SECTION_LABELS) {
    return STAFF_SECTION_LABELS[
      normalizedSectionId as keyof typeof STAFF_SECTION_LABELS
    ];
  }

  return fallbackTitle;
}

function getSectionItemContainerClassName(itemCount: number) {
  if (itemCount > 4) {
    return "grid gap-x-5 gap-y-4 md:grid-cols-2";
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
  value: PermissionEditDialogValue;
  onOpenChange: (open: boolean) => void;
  onChange: (value: PermissionEditDialogValue) => void;
  onSubmit: (value: NonNullable<PermissionEditDialogValue>) => void;
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

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError(null);
  }, [open, value]);

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
    ? value.sections.reduce<PermissionSectionApiItem[]>((result, section) => {
        if (section.id === "other") {
          const reportSection = result.find(
            (currentSection) => currentSection.id === "report",
          );

          if (reportSection) {
            reportSection.items = [...reportSection.items, ...section.items];
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
      title="จัดการสิทธิ์การเข้าถึง"
      widthClassName="max-w-none sm:max-w-none"
      contentClassName="top-8 translate-y-0"
      contentStyle={{ width: "min(980px, calc(100vw - 2rem))" }}
      bodyClassName="px-4 py-6 sm:px-5 sm:py-7"
      headerClassName="mb-5 text-center"
      titleClassName="text-[18px] font-bold normal-case tracking-normal text-[#3F73BB] sm:text-[20px]"
    >
      {loading ? (
        <p className="text-sm text-[#8B95A7]">กำลังโหลดข้อมูล...</p>
      ) : value ? (
        <div className="max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto pr-1">
          <div className="max-w-70 space-y-1.5">
            <label className="block text-[16px] text-[#111827]">ชื่อกลุ่ม</label>

            <div className="flex h-8 w-full items-center rounded-[6px] border border-[#A8B1C2] bg-[#F8FAFC] px-3 text-[13px] text-[#111827]">
              {value.teamName}
            </div>
          </div>

          <div className="rounded-[6px] border border-[#A8B1C2] bg-[#EEF4FF] p-3 sm:p-4">
            <p className="mb-3 text-[15px] font-semibold text-[#111827]">
              สิทธิ์การเข้าถึง
            </p>

            <div className="grid gap-4 md:grid-cols-2">
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

                  <div
                    className={getSectionItemContainerClassName(
                      section.items.length,
                    )}
                  >
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

          <div className="flex w-full justify-end gap-2 pt-1">
            <ProTechButton
              variant="delete"
              className="h-8 flex-1 min-w-0 sm:flex-none sm:min-w-18 text-[12px]"
              onClick={closeModal}
            >
              ยกเลิก
            </ProTechButton>

            <ProTechButton
              variant="primary"
              className="h-8 flex-1 min-w-0 sm:flex-none sm:min-w-18 text-[12px]"
              disabled={saving || value.permissionIds.length === 0}
              onClick={() => {
                if (value.permissionIds.length === 0) {
                  setValidationError("กรุณาเลือกอย่างน้อย 1 สิทธิ์");
                  return;
                }

                setValidationError(null);
                onSubmit(value);
              }}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
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
