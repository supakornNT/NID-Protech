"use client";

import { CheckCircle2 } from "lucide-react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";

export type ManagementSuccessAction = "create" | "update" | "delete";

type ActionSuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ManagementSuccessAction;
  subject?: string;
  title?: string;
  description?: string;
};

const ACTION_COPY: Record<
  ManagementSuccessAction,
  { title: string; description: string }
> = {
  create: {
    title: "เพิ่มข้อมูลสำเร็จ",
    description: "ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว",
  },
  update: {
    title: "แก้ไขข้อมูลสำเร็จ",
    description: "ระบบได้อัปเดตข้อมูลเรียบร้อยแล้ว",
  },
  delete: {
    title: "ลบข้อมูลสำเร็จ",
    description: "ระบบได้ลบข้อมูลเรียบร้อยแล้ว",
  },
};

export function ActionSuccessModal({
  open,
  onOpenChange,
  action,
  subject,
  title,
  description,
}: ActionSuccessModalProps) {
  const copy = ACTION_COPY[action];
  const resolvedTitle = title ?? (subject ? `${copy.title}` : copy.title);
  const resolvedDescription = description ?? (subject
    ? copy.description.replace("ข้อมูล", subject)
    : copy.description);

  return (
    <AdminModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={resolvedTitle}
      widthClassName="max-w-[460px]"
    >
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
            <CheckCircle2 size={34} />
          </div>
        </div>

        <p className="text-[15px] text-[#6B7280]">{resolvedDescription}</p>

        <div className="flex justify-center pt-1">
          <ProTechButton
            variant="primary"
            className="h-10 min-w-[120px]"
            onClick={() => onOpenChange(false)}
          >
            ตกลง
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
  );
}
