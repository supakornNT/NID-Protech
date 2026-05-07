"use client";

import { X } from "lucide-react";
import { ProTechButton } from "@/components/tables/protech-button";

type RejectWorkModalProps = {
  open: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RejectWorkModal({
  open,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
}: RejectWorkModalProps) {
  if (!open) return null;

  const disabled = reason.trim().length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#20498F]">
              ตีกลับงาน
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              กรุณาระบุเหตุผลที่ไม่อนุมัติการปิดงาน
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        <label className="text-sm font-medium text-gray-700">
          เหตุผลการตีกลับงาน
        </label>

        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="เช่น ยังไม่สามารถเข้าสู่ระบบได้ / ปัญหายังไม่ถูกแก้ไข"
          className="mt-2 min-h-[120px] w-full resize-none rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-[#2F66C5]"
        />

        <div className="mt-6 flex justify-end gap-3">
          <ProTechButton onClick={onClose} variant="outline">
            ยกเลิก
          </ProTechButton>

          <ProTechButton
            onClick={onConfirm}
            variant="danger"
            disabled={disabled}
          >
            ส่งตีกลับงาน
          </ProTechButton>
        </div>
      </div>
    </div>
  );
}