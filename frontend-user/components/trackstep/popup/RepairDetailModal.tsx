"use client";

import * as React from "react";
import { FileText, ImageIcon, X } from "lucide-react";

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
  title?: string;
  subtitle?: string;
  descriptionLabel?: string;
  dateLabel?: string;
  filesLabel?: string;
};

function formatDateTime(value: string): string {
  if (!value || value === "-" || value === "") return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function getFileMetaLabel(file: RepairFile) {
  const typeLabel = file.type === "pdf" ? "PDF" : "IMAGE";
  return file.uploadedAt && file.uploadedAt !== "-"
    ? `${typeLabel} | ${formatDateTime(file.uploadedAt)}`
    : typeLabel;
}

export default function RepairDetailModal({
  open,
  data,
  onClose,
  title,
  subtitle,
  descriptionLabel,
  dateLabel,
  filesLabel,
}: RepairDetailModalProps) {
  const [lightbox, setLightbox] = React.useState<string | null>(null);

  if (!open || !data) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {title || "รายละเอียดการแก้ไขปัญหา"}
              </h2>

              <p className="text-xs text-gray-500">
                {subtitle || "ขั้นตอนและหลักฐานการแก้ไขล่าสุด"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B45A5A] text-white transition hover:bg-[#9B4545] cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {data.repairedAt && data.repairedAt !== "" && data.repairedAt !== "-" ? (
            <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
              <p>{dateLabel || "วันที่ดำเนินการ"}</p>
              <p>{formatDateTime(data.repairedAt)}</p>
            </div>
          ) : null}

          {data.description && data.description !== "" && data.description !== "-" ? (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                {descriptionLabel || "รายละเอียดการแก้ไข"}
              </p>
              <p className="break-words text-sm text-gray-700 whitespace-pre-wrap [overflow-wrap:anywhere]">
                {data.description}
              </p>
            </div>
          ) : null}

          {data.files.length > 0 ? (
            <>
              <p className="mb-2 mt-4 text-sm text-gray-500 font-medium">
                {filesLabel || "ไฟล์หลักฐานการแก้ไข"} ({data.files.length})
              </p>
              <div className="space-y-2">
                {data.files.map((file) => {
                  const isImage = file.type === "image";
                  return isImage ? (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setLightbox(file.url)}
                      className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <ImageIcon size={20} className="text-blue-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {file.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {getFileMetaLabel(file)}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <FileText size={20} className="text-red-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {file.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {getFileMetaLabel(file)}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 px-4 py-6"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300 cursor-pointer"
            onClick={() => setLightbox(null)}
          >
            <X size={32} />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
