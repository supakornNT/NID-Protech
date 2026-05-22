"use client";

import { useMemo, useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import type { UserGroupMemberFormInput } from "@/hooks/user-groups/use-user-groups-page";

type Option = {
  value: number;
  label: string;
};

type TeamMemberModalProps = {
  open: boolean;
  saving: boolean;
  mode: "create" | "edit";
  initialValue: UserGroupMemberFormInput;
  staffName: string;
  staffOptions: Option[];
  teamOptions: Option[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: UserGroupMemberFormInput) => void;
};

export function TeamMemberModal({
  open,
  saving,
  mode,
  initialValue,
  staffName,
  staffOptions,
  teamOptions,
  onOpenChange,
  onSubmit,
}: TeamMemberModalProps) {
  const [formState, setFormState] = useState<UserGroupMemberFormInput>(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resolvedStaffName = useMemo(() => {
    if (mode === "edit" && staffName) {
      return staffName;
    }

    return (
      staffOptions.find((option) => option.value === formState.staffId)?.label ??
      ""
    );
  }, [formState.staffId, mode, staffName, staffOptions]);

  function toggleTeam(teamId: number) {
    setFormState((current) => ({
      ...current,
      teamIds: current.teamIds.includes(teamId)
        ? current.teamIds.filter((currentTeamId) => currentTeamId !== teamId)
        : [...current.teamIds, teamId],
    }));
  }

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
        mode === "edit" ? "แก้ไขคนในกลุ่มผู้ใช้งาน" : "เพิ่มคนเข้ากลุ่มผู้ใช้งาน"
      }
      widthClassName="max-w-[760px]"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">
              ผู้ใช้งาน
            </label>
            {mode === "edit" ? (
              <div className="flex h-8.5 items-center rounded-md border border-[#A8B1C2] bg-[#F8FAFC] px-3 text-[14px] text-[#111827]">
                {resolvedStaffName}
              </div>
            ) : (
              <select
                value={formState.staffId ?? ""}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    staffId: Number(event.target.value) || null,
                  }))
                }
                className="h-8.5 w-full rounded-md border border-[#A8B1C2] bg-white px-3 text-[14px] text-[#111827] outline-none"
              >
                <option value="">เลือกผู้ใช้งาน</option>
                {staffOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[16px] text-[#111827]">
            กลุ่มผู้ใช้งาน
          </label>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-[#A8B1C2] bg-white p-3">
            {teamOptions.map((option) => {
              const checked = formState.teamIds.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    toggleTeam(option.value);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-[#EEF4FF]"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border text-[12px] ${
                      checked
                        ? "border-[#3F73BB] bg-[#3F73BB] text-white"
                        : "border-[#A8B1C2] bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-[14px] text-[#111827]">
                    {option.label}
                  </span>
                </button>
              );
            })}

            {teamOptions.length === 0 ? (
              <p className="text-sm text-[#8B95A7]">ไม่พบข้อมูลกลุ่มผู้ใช้งาน</p>
            ) : null}
          </div>
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
              if (!formState.staffId) {
                setValidationError("กรุณาเลือกผู้ใช้งาน");
                return;
              }

              setValidationError(null);
              onSubmit(formState);
            }}
          >
            {saving ? "กำลังบันทึก..." : mode === "edit" ? "แก้ไข" : "ยืนยัน"}
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
  );
}
