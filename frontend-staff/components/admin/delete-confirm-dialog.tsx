"use client";

import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { ProTechButton } from "@/components/tables/protech-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DeleteConfirmDialogProps = {
 trigger: React.ReactElement;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export function DeleteConfirmDialog({
  trigger,
  title = "ยืนยันการลบข้อมูล",
  description = "เมื่อลบข้อมูลแล้วจะไม่สามารถกู้คืนกลับได้",
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] rounded-[28px] bg-[#ffffff] p-0 shadow-xl ring-0"
      >
        <div className="space-y-6 px-7 py-7">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-[#F59E0B]">
              <TriangleAlert size={28} />
            </div>
          </div>

          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-[24px] font-bold normal-case tracking-normal text-[#111827]">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-0 text-[16px] text-[#6B7280]">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 pt-1">
            <DialogClose
              render={
                <ProTechButton variant="delete" className="h-10 min-w-[104px] text-[16px]" />
              }
            >
              {cancelLabel}
            </DialogClose>

            <DialogClose
              render={
                <ProTechButton
                  variant="primary"
                  className="h-10 min-w-[104px] text-[16px]"
                  onClick={onConfirm}
                />
              }
            >
              {confirmLabel}
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
