"use client";

import { ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OtpInput } from "@/components/ui/otp-input";

type OtpModalProps = {
  open: boolean;
  email: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  error?: string;
};

export function OtpModal({
  open,
  email,
  otp,
  onOtpChange,
  onConfirm,
  onClose,
  loading = false,
  error,
}: OtpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] rounded-[16px] border border-[#3F73BB] bg-white p-0 shadow-[0_10px_24px_rgba(47,102,197,0.18)]"
      >
        <div className="px-6 py-5">
          {/* Header */}
          <DialogHeader className="mb-5 items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF4FF] text-[#2F66C5]">
              <ShieldCheck size={30} />
            </div>
            <DialogTitle className="text-[20px] font-bold normal-case tracking-normal text-[#3F73BB]">
              ยืนยันตัวตน
            </DialogTitle>
            <p className="mt-1 text-[13px] leading-relaxed text-[#929396]">
              กรุณากรอกรหัส OTP ที่ส่งไปยัง{" "}
              <span className="font-medium text-[#2F66C5]">{email}</span>
            </p>
          </DialogHeader>

          {/* OTP Input */}
          <div className="mb-4">
            <OtpInput email={email} onOtpChange={onOtpChange} />
          </div>

          {/* Error box */}
          {error && (
            <div className="mb-4 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-gray-300 bg-white px-6 text-sm text-gray-600 transition duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="h-10 min-w-[120px] rounded-xl bg-[#2F66C5] px-6 text-sm font-semibold text-white transition duration-200 hover:bg-[#3564A8] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังยืนยัน..." : "ยืนยัน"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
