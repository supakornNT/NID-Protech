"use client";

import * as React from "react";
import { FileText, ImageIcon, X } from "lucide-react";

import { RepairFile } from "@/types/tracking";

type RequestAttachmentModalProps = {
  open: boolean;
  files: RepairFile[];
  onClose: () => void;
};

function getFileMetaLabel(file: RepairFile) {
  const typeLabel = file.type === "pdf" ? "PDF" : "IMAGE";
  return file.uploadedAt && file.uploadedAt !== "-"
    ? `${typeLabel} | ${file.uploadedAt}`
    : typeLabel;
}

export default function RequestAttachmentModal({
  open,
  files,
  onClose,
}: RequestAttachmentModalProps) {
  const [lightbox, setLightbox] = React.useState<string | null>(null);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-800 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                ไฟล์แนบจากการแจ้งปัญหา
              </h2>
              <p className="text-xs text-gray-500">
                ไฟล์ที่ผู้ใช้แนบมาตอนสร้างคำขอ
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B45A5A] text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <p className="mb-2 text-sm text-gray-500">ไฟล์แนบ ({files.length})</p>

          {files.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              ไม่พบไฟล์แนบจากการแจ้งปัญหา
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
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
          )}
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
