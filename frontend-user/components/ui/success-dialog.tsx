"use client";

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
  title = "ส่งรายงานสำเร็จ!",
  description = "ระบบได้รับรายงานของคุณแล้ว",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-center rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-600">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">{description}</p>
        <button
          className="mt-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          onClick={onClose}
        >
          ตกลง
        </button>
      </DialogContent>
    </Dialog>
  );
}
