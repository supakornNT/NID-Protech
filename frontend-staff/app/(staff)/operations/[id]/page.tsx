"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  ImageIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import { useTicketWork } from "@/hooks/use-ticket-work";
import { useLoadingDelay } from "@/hooks/use-loading-delay";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const IMAGE_EXTS = ["jpg", "jpeg", "png"];

function AttachmentRow({
  name,
  ext,
  url,
}: {
  name: string;
  ext: string;
  url: string;
}) {
  const isImage = IMAGE_EXTS.includes(ext.toLowerCase());

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50"
    >
      {isImage ? (
        <ImageIcon size={20} className="shrink-0 text-blue-400" />
      ) : (
        <FileText size={20} className="shrink-0 text-red-400" />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-gray-800">{name}</span>
        <span className="text-[11px] uppercase text-gray-400">{ext}</span>
      </div>
    </a>
  );
}

export default function OperationDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    data,
    loading,
    error,
    ticketAttachments,
    hideAttachment,
    submitResolution,
  } = useTicketWork(id);
  const showSkeleton = useLoadingDelay(loading, 200);
  const { attachments } = useComplaintDetail(data?.requestId?.toString());
  const { lightbox, setLightbox } = useLightbox();

  const [resolution, setResolution] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [prevTicketId, setPrevTicketId] = useState<number | undefined>(undefined);

  if (data?.ticketId !== prevTicketId) {
    setPrevTicketId(data?.ticketId);
    setResolution(data?.resolutionSummary ?? "");
    setSelectedFiles([]);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPendingReview = data?.resolutionRequestStatus === "pending";

  async function handleSubmit() {
    if (!resolution.trim() || isPendingReview) return;
    setSubmitting(true);
    try {
      await submitResolution(resolution, selectedFiles);
      router.push("/operations");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  if (error || (!loading && !data)) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 text-white hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >
            <X size={32} />
          </button>
          <div onClick={(event) => event.stopPropagation()}>
            <Image
              src={lightbox}
              alt="preview"
              width={900}
              height={700}
              unoptimized
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 bg-[#F0F4FA] p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">
                {data?.ticketTitle ?? "รายละเอียดงาน"}
              </h1>
              <p className="text-[13px] text-gray-500">
                {data?.ticketDescription ?? "-"}
              </p>
            </div>
          </div>
          {data?.requestId ? (
            <a
              href={`${API_BASE_URL}/requests/${data.requestId}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50"
            >
              <FileText size={15} />
              ดูเอกสาร
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-[14px] text-gray-400 cursor-not-allowed">
              <FileText size={15} />
              ดูเอกสาร
            </div>
          )}
        </div>

        {!!data?.rejectNote && (
          <div className="flex items-start gap-3 rounded-xl border border-[#F4A0A0] bg-[#FFF5F5] px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#D9534F]" />
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-[#D9534F]">
                ถูกตีกลับ
              </p>
              <p className="text-[13px] text-gray-700">{data.rejectNote}</p>
            </div>
          </div>
        )}

        {loading ? (
          showSkeleton ? (
            <div className="flex min-h-[700px] w-full animate-pulse gap-12">
              <div className="flex flex-1 shrink-0 flex-col gap-5 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="h-7 w-3/4 rounded bg-gray-200" />
                  <div className="h-6 w-28 rounded bg-gray-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                </div>
                <div className="h-80 w-full rounded-lg bg-gray-100" />
              </div>

              <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
                <div className="h-6 w-1/2 rounded bg-gray-200" />
                <div className="mt-6 h-80 w-full rounded-lg bg-gray-100" />
                <div className="mt-auto flex justify-end gap-2">
                  <div className="h-10 w-24 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ) : null
        ) : !data ? (
          <div className="flex min-h-[700px] flex-1 items-center justify-center rounded-2xl border border-gray-300 bg-white p-8 text-gray-500">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="flex min-h-[700px] gap-12">
            <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[18px] font-bold text-gray-900">
                  {data.title}
                </p>
                <span className="shrink-0 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
                  ประเภท : {data.problemName}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 text-[13px] text-gray-500">
                <p>ผู้ใช้งานภายในองค์กร : {data.customerName}</p>
                <p>ระบบ : {data.systemName ?? "-"}</p>
              </div>

              <textarea
                readOnly
                value={data.detail}
                rows={12}
                className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 text-[13px] text-gray-700 outline-none"
              />

              {attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[13px] text-gray-500">
                    ไฟล์แนบ ({attachments.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {attachments.map((file) => {
                      const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
                      const isImage = IMAGE_EXTS.includes(
                        (file.fileExt ?? "").toLowerCase(),
                      );
                      return isImage ? (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setLightbox(url)}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <ImageIcon
                            size={20}
                            className="shrink-0 text-blue-400"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-medium text-gray-800">
                              {file.originalName}
                            </span>
                            <span className="text-[11px] uppercase text-gray-400">
                              {file.fileExt}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <AttachmentRow
                          key={file.id}
                          name={file.originalName}
                          ext={file.fileExt}
                          url={url}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
              <div>
                <p className="text-[16px] font-bold text-gray-900">
                  รายละเอียดการแก้ไขปัญหา
                </p>
                <p className="text-[13px] text-gray-500">
                  ขั้นตอนและสรุปผลการแก้ไข
                </p>
              </div>

              {isPendingReview && (
                <div className="mt-6 rounded-xl border border-dashed border-[#4CAF7D] bg-[#EDFAF3] p-4 text-center">
                  <p className="text-[15px] font-semibold text-[#1A7A4A]">
                    ส่งคำขอปิดงานแล้ว
                  </p>
                  <p className="text-[13px] text-gray-500">
                    รอหัวหน้าพิจารณาผลการแก้ไขจากข้อมูลด้านล่าง
                  </p>
                </div>
              )}

              <textarea
                value={resolution}
                onChange={(event) => setResolution(event.target.value)}
                rows={12}
                placeholder="ระบุสรุปผลการแก้ไข"
                disabled={isPendingReview}
                className="mt-16 w-full resize-none rounded-lg border border-gray-300 p-3 text-[13px] text-gray-700 outline-none focus:border-[#366DBD] disabled:bg-gray-100 disabled:text-gray-500"
              />

              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-gray-500">ไฟล์แนบ</p>
                  <button
                    type="button"
                    disabled={isPendingReview}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <Plus size={13} />
                    เพิ่ม
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    disabled={isPendingReview}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {selectedFiles.map((file, index) => {
                      const ext = file.name.split(".").pop() ?? "";
                      const isImage = IMAGE_EXTS.includes(ext.toLowerCase());
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <button
                            type="button"
                            disabled={!isImage}
                            onClick={() => {
                              if (isImage)
                                setLightbox(URL.createObjectURL(file));
                            }}
                            className="flex items-center gap-3 disabled:cursor-default"
                          >
                            {isImage ? (
                              <ImageIcon size={20} className="text-blue-400" />
                            ) : (
                              <FileText size={20} className="text-red-400" />
                            )}
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="text-[13px] font-medium text-gray-800">
                                {file.name}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {ext.toUpperCase()} |{" "}
                                {(file.size / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          </button>
                          <button
                            type="button"
                            disabled={isPendingReview}
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {ticketAttachments.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-[13px] text-gray-500">
                    ไฟล์แนบที่ส่งไปก่อนหน้า ({ticketAttachments.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {ticketAttachments.map((file) => {
                      const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
                      const isImage = IMAGE_EXTS.includes(
                        (file.fileExt ?? "").toLowerCase(),
                      );
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 text-[13px] text-gray-700 hover:underline"
                          >
                            {isImage ? (
                              <ImageIcon
                                size={20}
                                className="shrink-0 text-blue-400"
                              />
                            ) : (
                              <FileText
                                size={20}
                                className="shrink-0 text-red-400"
                              />
                            )}
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="text-[13px] font-medium text-gray-800">
                                {file.originalName}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {file.fileExt.toUpperCase()}
                              </span>
                            </div>
                          </a>
                          <button
                            type="button"
                            disabled={isPendingReview}
                            onClick={() => void hideAttachment(file.id)}
                            className="text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-auto flex justify-end pt-4">
                <button
                  type="button"
                  disabled={submitting || !resolution.trim() || isPendingReview}
                  onClick={() => void handleSubmit()}
                  className="rounded-lg bg-[#366DBD] px-8 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-50"
                >
                  {submitting
                    ? "กำลังส่ง..."
                    : isPendingReview
                      ? "รออนุมัติ"
                      : "ส่งงาน"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
