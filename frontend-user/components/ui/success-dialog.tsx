"use client";

import { CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
};

export function SuccessDialog({
  open,
  onClose,
  title = "ส่งรายการสำเร็จ!",
  description = "ระบบได้รับรายการของคุณแล้ว",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] rounded-[16px] border border-[#3F73BB] bg-white p-0 shadow-[0_10px_24px_rgba(47,102,197,0.18)]"
      >
        <div className="px-6 py-5">
          <DialogHeader className="mb-5 text-center">
            <DialogTitle className="text-[24px] font-bold normal-case tracking-normal text-[#3F73BB]">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
                <CheckCircle2 size={34} />
              </div>
            </div>

            <p className="text-[15px] text-[#6B7280]">{description}</p>

            <div className="flex justify-center pt-1">
              <button
                type="button"
                className="h-10 min-w-[120px] rounded-xl bg-[#2F66C5] px-6 text-sm font-semibold text-white transition duration-200 hover:bg-[#3564A8] active:scale-[0.98]"
                onClick={onClose}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
