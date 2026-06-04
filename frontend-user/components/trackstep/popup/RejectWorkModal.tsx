"use client";

import { X } from "lucide-react";

import { ProTechButton } from "@/components/tables/protech-button";

type RejectWorkModalProps = {
  open: boolean;
  reason: string;
  files: File[];
  loading?: boolean;
  onReasonChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RejectWorkModal({
  open,
  reason,
  files,
  loading = false,
  onReasonChange,
  onFilesChange,
  onClose,
  onConfirm,
}: RejectWorkModalProps) {
  if (!open) return null;

  const disabled = reason.trim().length === 0 || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#20498F]">
              ตีกลับงาน
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              กรุณาระบุเหตุผลและแนบไฟล์เพิ่มเติมถ้าต้องการ
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
          placeholder="เช่น ปัญหายังไม่ถูกแก้ไข หรือผลลัพธ์ยังไม่ตรงตามที่แจ้ง"
          className="mt-2 min-h-[120px] w-full resize-none rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-[#2F66C5]"
        />

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">
            ไฟล์แนบเพิ่มเติม
          </label>

          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => onFilesChange(Array.from(e.target.files ?? []))}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#E8F0FF] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#20498F]"
          />

          {files.length > 0 ? (
            <div className="mt-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
              {files.map((file) => (
                <p key={`${file.name}-${file.lastModified}`} className="text-sm text-gray-600">
                  {file.name}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <ProTechButton onClick={onClose} variant="outline" disabled={loading}>
            ยกเลิก
          </ProTechButton>

          <ProTechButton onClick={onConfirm} disabled={disabled}>
            {loading ? "กำลังส่ง..." : "ส่งตีกลับงาน"}
          </ProTechButton>
        </div>
      </div>
    </div>
  );
}
