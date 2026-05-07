"use client";

import {
  FileText,
  ImageIcon,
  X,
} from "lucide-react";

export type RepairFile = {
  id: number;
  name: string;
  type: "pdf" | "image";
  size: string;
  uploadedAt: string;
  url: string;
};

export type RepairDetail = {
  description: string;
  repairedAt: string;
  files: RepairFile[];
};

export type RepairDetailModalProps = {
  open: boolean;
  data: RepairDetail | null;
  onClose: () => void;
};

export default function RepairDetailModal({
  open,
  data,
  onClose,
}: RepairDetailModalProps) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              รายละเอียดการแก้ไขปัญหา
            </h2>

            <p className="text-xs text-gray-500">
              ขั้นตอนบริการการแก้ไข
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B45A5A] text-white"
          >
            <X size={14} />
          </button>
        </div>

        <textarea
          readOnly
          value={data.description}
          className="min-h-[165px] w-full resize-none rounded-md border border-gray-700 p-3 text-sm text-gray-700 outline-none"
        />

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <p>วันที่ดำเนินการ</p>

          <p>{data.repairedAt}</p>
        </div>

        <p className="mb-2 mt-4 text-sm text-gray-500">
          ไฟล์แนบ ({data.files.length})
        </p>

        <div className="space-y-2">
          {data.files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {file.type === "pdf" ? (
                  <FileText
                    size={20}
                    className="text-red-500"
                  />
                ) : (
                  <ImageIcon
                    size={20}
                    className="text-gray-600"
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {file.name}
                </p>

                <p className="text-xs text-gray-500">
                  {file.type.toUpperCase()} -{" "}
                  {file.size} -{" "}
                  {file.uploadedAt}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}