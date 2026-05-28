"use client";

import { useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import type { UserGroupMemberFormInput } from "@/hooks/user-groups/use-user-groups-page";

type TeamMemberModalProps = {
  open: boolean;
  saving: boolean;
  initialValue: UserGroupMemberFormInput;
  staffName: string;
  teamOptions: Array<{
    value: number;
    label: string;
  }>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: UserGroupMemberFormInput) => void;
};

export function TeamMemberModal({
  open,
  saving,
  initialValue,
  staffName,
  teamOptions,
  onOpenChange,
  onSubmit,
}: TeamMemberModalProps) {
  const [formState, setFormState] =
    useState<UserGroupMemberFormInput>(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      title="แก้ไขคนในกลุ่มผู้ใช้งาน"
      widthClassName="max-w-[760px]"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">
              ผู้ใช้งาน
            </label>
            <div className="flex h-8.5 items-center rounded-md border border-[#A8B1C2] bg-[#F8FAFC] px-3 text-[14px] text-[#111827]">
              {staffName}
            </div>
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
              <p className="text-sm text-[#8B95A7]">
                ไม่พบข้อมูลกลุ่มผู้ใช้งาน
              </p>
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
            {saving ? "กำลังบันทึก..." : "แก้ไข"}
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
  );
}
