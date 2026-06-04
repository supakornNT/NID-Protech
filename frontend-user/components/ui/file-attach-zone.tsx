"use client";
import { useRef, useState } from "react";
import { FileText, ImageIcon, Camera, Paperclip, X } from "lucide-react";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const MAX_SIZE = 10 * 1024 * 1024;

function formatThaiDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

type FileAttachZoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

export function FileAttachZone({ files, onChange }: FileAttachZoneProps) {
  const browseRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const valid: File[] = [];
    const oversized: string[] = [];
    for (const file of Array.from(incoming)) {
      if (file.size > MAX_SIZE) oversized.push(file.name);
      else valid.push(file);
    }
    if (oversized.length > 0)
      alert(`ไฟล์ต่อไปนี้มีขนาดเกิน 10MB:\n${oversized.join("\n")}`);
    onChange([...files, ...valid]);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function openPreview(file: File) {
    const url = URL.createObjectURL(file);
    setLightboxUrl(url);
  }

  function closeLightbox() {
    if (lightboxUrl) URL.revokeObjectURL(lightboxUrl);
    setLightboxUrl(null);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => browseRef.current?.click()}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100"
          >
            <Paperclip size={16} />
            เลือกไฟล์
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100"
          >
            <Camera size={16} />
            ถ่ายภาพ
          </button>
          <input
            ref={browseRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <p className="text-xs text-gray-400">รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB</p>

        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            {files.map((file, i) => {
              const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
              const isImage = IMAGE_EXTS.includes(ext);
              const nameNoExt = file.name.replace(/\.[^/.]+$/, "");
              const label = isImage ? ext.toUpperCase() : "PDF";
              const size = formatSize(file.size);
              const date = formatThaiDate(new Date(file.lastModified));

              return (
                <div
                  key={`${file.name}-${file.lastModified}-${i}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3"
                >
                  <button
                    type="button"
                    onClick={() => isImage && openPreview(file)}
                    className={`flex min-w-0 items-center gap-3 ${isImage ? "cursor-zoom-in" : "cursor-default"}`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isImage ? "bg-blue-50" : "bg-red-50"}`}
                    >
                      {isImage ? (
                        <ImageIcon size={20} className="text-blue-500" />
                      ) : (
                        <FileText size={20} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col text-left">
                      <span className="truncate text-[13px] font-medium text-gray-800 sm:text-sm">
                        {nameNoExt}
                      </span>
                      <span className="text-[11px] text-gray-400 sm:text-xs">
                        {label} · {size} · {date}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center text-gray-400 hover:text-red-500 active:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxUrl}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
