"use client";

import { ProTechButton } from "@/components/tables/protech-button";

type ConfirmCloseModalProps = {
  open: boolean;

  title: string;

  description?: string;

  subDescription?: string;

  confirmText?: string;

  cancelText?: string;

  onClose: () => void;

  onConfirm: () => void;
};

export default function ConfirmCloseModal({
  open,
  title,
  description,
  subDescription,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onClose,
  onConfirm,
}: ConfirmCloseModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#20498F]">{title}</h2>

        {description && (
          <p className="mt-3 text-sm text-gray-600">{description}</p>
        )}

        {subDescription && (
          <p className="mt-1 text-sm text-gray-500">{subDescription}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <ProTechButton
            onClick={onClose}
            variant="outline"
          >
            {cancelText}
          </ProTechButton>
          <ProTechButton onClick={onConfirm}>{confirmText}</ProTechButton>
        </div>
      </div>
    </div>
  );
}
