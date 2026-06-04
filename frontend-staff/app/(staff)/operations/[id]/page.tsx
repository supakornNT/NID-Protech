"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, ImageIcon, X, Plus, AlertCircle, Trash2 } from "lucide-react";
import { useTicketWork } from "@/hooks/use-ticket-work";
import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import Image from "next/image";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";

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

  const { data, loading, error, ticketAttachments, hideAttachment, submitResolution } = useTicketWork(id);
  const { attachments } = useComplaintDetail(data?.requestId?.toString());
  const { lightbox, setLightbox } = useLightbox();

  const [resolution, setResolution] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConfirm = data?.ticketStatus === "waiting_confirm";

  async function handleSubmit() {
    if (!resolution.trim()) return;
    setSubmitting(true);
    try {
      await submitResolution(resolution, selectedFiles);
      router.push("/operations");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
      {/* Lightbox */}
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
          <div onClick={(e) => e.stopPropagation()}>
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

      {/* Reject modal */}
      <AdminModalShell
        open={rejectOpen}
        onOpenChange={(open) => {
          if (!open) setRejectOpen(false);
        }}
        title="เหตุผลไม่อนุมัติ"
        widthClassName="max-w-[440px]"
      >
        <div className="flex flex-col gap-4">
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="ระบุเหตุผล..."
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
              }}
              className="rounded-lg bg-[#D9534F] px-5 py-2 text-[13px] font-semibold text-white hover:bg-red-600"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </AdminModalShell>

      <div className="flex flex-1 flex-col gap-4 bg-[#F0F4FA] p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              {data.ticketTitle}
            </h1>
            <p className="text-[14px] text-gray-500">{data.ticketDescription}</p>
          </div>
          <a
            href={`${API_BASE_URL}/requests/${data?.requestId}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50"
          >
            <FileText size={15} />
            ดูเอกสาร
          </a>
        </div>

        {/* Reject note alert */}
        {!!data?.rejectNote && (
          <div className="flex items-start gap-3 rounded-xl border border-[#F4A0A0] bg-[#FFF5F5] px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#D9534F]" />
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-[#D9534F]">ถูกตีกลับ</p>
              <p className="text-[13px] text-gray-700">{data?.rejectNote}</p>
            </div>
          </div>
        )}

        {/* Main content */}
        {loading ? (
          <div className="flex min-h-[700px] gap-12 animate-pulse w-full">
            {/* Left panel skeleton */}
            <div className="flex flex-1 shrink-0 flex-col gap-5 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
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

            {/* Right panel skeleton */}
            <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
              <div className="h-6 w-1/2 rounded bg-gray-200" />
              <div className="h-80 w-full rounded-lg bg-gray-100 mt-6" />
              <div className="flex justify-end gap-2 mt-auto">
                <div className="h-10 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center p-8 text-gray-500 bg-white rounded-2xl border border-[#000000] min-h-[700px]">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="flex min-h-[700px] gap-12">
            {/* Left panel — request info (read-only) */}
            <div className="flex flex-1 flex-col  gap-5 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
            {/* Title + type */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-[18px] font-bold text-gray-900">
                {data.title}
              </p>
              <span className="shrink-0 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
                ประเภท : {data.problemName}
              </span>
            </div>

            {/* Customer / system */}
            <div className="flex flex-col gap-0.5 text-[13px] text-gray-500">
              <p>ผู้ใช้งานภายในองค์กร : {data.customerName}</p>
              <p>ระบบ : {data.systemName ?? "—"}</p>
            </div>

            {/* Request detail */}
            <textarea
              readOnly
              value={data.detail}
              rows={12}
              className="w-full resize-none rounded-lg border border-[#000000] bg-gray-50 p-3 text-[13px] text-gray-700 outline-none"
            />

            {/* Attachments */}
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

            {/* Reject button */}
            {/* <div className="mt-auto flex justify-end">
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                className="rounded-lg border border-[#D9534F] px-5 py-2 text-[13px] font-semibold text-[#D9534F] hover:bg-red-50"
              >
                เหตุผลไม่อนุมัติ
              </button>
            </div> */}
          </div>

          {/* Right panel — resolution form */}
          <div className="flex flex-1 flex-col rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
            <div>
              <p className="text-[16px] font-bold text-gray-900">
                รายละเอียดการแก้ไขปัญหา
              </p>
              <p className="text-[13px]  text-gray-500">ขั้นตอนวิธีการแก้ไข</p>
            </div>

            {/* Resolved — ส่งงานแล้ว รอตรวจสอบ */}
            {isConfirm && (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#4CAF7D] bg-[#EDFAF3] p-8 text-center">
                <p className="text-[15px] font-semibold text-[#1A7A4A]">
                  ส่งงานเสร็จสิ้นแล้ว
                </p>
                <p className="text-[13px] text-gray-500">
                  รอผู้ดูแลระบบตรวจสอบผลการแก้ไข
                </p>
              </div>
            )}

            {/* In-progress — แสดง form */}
            {!isConfirm && (
              <>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={12}
                  placeholder="รายละเอียด"
                  className="mt-16 w-full resize-none rounded-lg border border-black p-3 text-[13px] text-gray-700 outline-none focus:border-[#366DBD]"
                />

                {/* File upload */}
                <div className="flex flex-col gap-2">
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[13px] text-gray-500">ไฟล์แนบ</p>
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
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {selectedFiles.map((file, i) => {
                        const ext = file.name.split(".").pop() ?? "";
                        const isImage = IMAGE_EXTS.includes(ext.toLowerCase());
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
                          >
                            <button
                              type="button"
                              disabled={!isImage}
                              onClick={() => {
                                if (isImage) setLightbox(URL.createObjectURL(file));
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
                                  {ext.toUpperCase()} · {(file.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Existing ticket attachments */}
                {ticketAttachments.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] text-gray-500">ไฟล์แนบที่ส่งไปก่อนหน้า ({ticketAttachments.length})</p>
                    <div className="flex flex-col gap-2">
                      {ticketAttachments.map((file) => {
                        const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
                        const isImage = IMAGE_EXTS.includes((file.fileExt ?? "").toLowerCase());
                        return (
                          <div key={file.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                            <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[13px] text-gray-700 hover:underline">
                              {isImage ? <ImageIcon size={20} className="shrink-0 text-blue-400" /> : <FileText size={20} className="shrink-0 text-red-400" />}
                              <div className="flex flex-col gap-0.5 text-left">
                                <span className="text-[13px] font-medium text-gray-800">{file.originalName}</span>
                                <span className="text-[11px] text-gray-400">{file.fileExt.toUpperCase()}</span>
                              </div>
                            </a>
                            <button
                              type="button"
                              onClick={() => hideAttachment(file.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="mt-auto flex justify-end pt-4">
                  <button
                    type="button"
                    disabled={submitting || !resolution.trim()}
                    onClick={handleSubmit}
                    className="rounded-lg bg-[#366DBD] px-8 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-50"
                  >
                    {submitting ? "กำลังส่ง..." : "ส่งงาน"}
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
