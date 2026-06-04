"use client";

import { useRef } from "react";
import { FileText, ImageIcon, Plus, X } from "lucide-react";

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

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const disabled = reason.trim().length === 0 || loading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    onFilesChange([...files, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

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

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              ไฟล์แนบเพิ่มเติม
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50"
            >
              <Plus size={13} />
              เพิ่ม
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
              {files.map((file, i) => {
                const ext = file.name.split(".").pop() ?? "";
                const isImage = IMAGE_EXTS.includes(ext.toLowerCase());
                return (
                  <div
                    key={`${file.name}-${file.lastModified}-${i}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isImage ? (
                        <ImageIcon size={20} className="shrink-0 text-blue-400" />
                      ) : (
                        <FileText size={20} className="shrink-0 text-red-400" />
                      )}
                      <div className="flex flex-col gap-0.5 text-left min-w-0">
                        <span className="text-[13px] font-medium text-gray-800 truncate block">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-gray-400 uppercase">
                          {ext} | {(file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
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
