"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, FileText, ImageIcon, X } from "lucide-react";
import { useComplaintDetail, useLightbox } from "@/hooks/use-complaint-detail";
import { useLoadingDelay } from "@/hooks/use-loading-delay";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <p className="text-[15px] font-medium text-gray-800">{label}</p>
      <input
        type="text"
        value={value ?? "—"}
        disabled
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-gray-700 outline-none cursor-not-allowed"
      />
    </div>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, attachments, loading } = useComplaintDetail(id);
  const { lightbox, setLightbox } = useLightbox();
  const showSkeleton = useLoadingDelay(loading, 200);

  const isInternal = data?.organizationName !== null && data?.organizationName !== undefined;

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
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

      <div className="flex min-h-screen items-start justify-center bg-[#F0F4FA] p-6 pt-12">
        <div className="w-full max-w-3xl rounded-2xl border border-gray-300 bg-white shadow-sm">
          {loading ? (
            showSkeleton ? (
              <div className="animate-pulse">
              <div className="border-b px-8 pt-6 pb-4">
                <div className="h-6 w-48 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
              </div>
              <div className="flex flex-col gap-5 px-8 py-6">
                <div className="flex gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-4 w-16 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded-lg bg-gray-200" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-4 w-16 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded-lg bg-gray-200" />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-4 w-16 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded-lg bg-gray-200" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-4 w-16 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded-lg bg-gray-200" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                  <div className="h-36 w-full rounded-lg bg-gray-200" />
                </div>
              </div>
              <div className="flex justify-end px-8 pb-6">
                <div className="h-9 w-24 rounded-full bg-gray-200" />
              </div>
            </div>
            ) : null
          ) : !data ? (
            <div className="flex min-h-[300px] items-center justify-center p-8 text-gray-400">
              ไม่พบข้อมูล
            </div>
          ) : (
            <>
              <div className="border-b px-4 sm:px-8 pt-6 pb-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="text-[22px] font-bold text-gray-900">รายละเอียดข้อร้องเรียน</h1>
                    <p className="mt-1 text-[13px] text-gray-400">
                      {isInternal ? "ภายในองค์กร" : "บุคคลทั่วไป"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 px-4 sm:px-8 py-6">
            {isInternal ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Field label="ผู้แจ้ง" value={data.customerName} />
                <Field label="หน่วยงาน" value={data.organizationName} />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Field label="ผู้แจ้ง" value={data.customerName} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Field label="ระบบ" value={data.systemName} />
              <Field label="ประเภทข้อร้องเรียน" value={data.problemName} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Field label="หัวข้อเรื่อง" value={data.title} />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-medium text-gray-800">รายละเอียด</p>
              <textarea
                value={data.detail ?? "—"}
                disabled
                className="min-h-36 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-gray-700 outline-none cursor-not-allowed"
              />
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[15px] font-medium text-gray-800">ไฟล์แนบ</p>
                <div className="flex flex-col gap-2">
                  {attachments.map((file) => {
                    const fileName = file.savedName ?? file.originalName;
                    const url = `${API_BASE_URL}/uploads/requests/${fileName}`;
                    const ext = file.fileExt.toLowerCase();
                    const isImage = IMAGE_EXTS.includes(ext);
                    const nameNoExt = file.originalName.replace(new RegExp(`\\.${ext}$`, "i"), "");
                    return isImage ? (
                      <button key={file.id} type="button" onClick={() => setLightbox(url)} className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 cursor-zoom-in hover:bg-gray-50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <ImageIcon size={20} className="text-blue-500" />
                        </div>
                        <div className="flex min-w-0 flex-col text-left">
                          <span className="truncate text-[13px] font-medium text-gray-800">{nameNoExt}</span>
                          <span className="text-[11px] text-gray-400">{ext.toUpperCase()}</span>
                        </div>
                      </button>
                    ) : (
                      <a key={file.id} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 hover:bg-gray-50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                          <FileText size={20} className="text-red-500" />
                        </div>
                        <div className="flex min-w-0 flex-col text-left">
                          <span className="truncate text-[13px] font-medium text-gray-800">{nameNoExt}</span>
                          <span className="text-[11px] text-gray-400">{ext.toUpperCase()}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end px-4 sm:px-8 pb-6">
            <button
              type="button"
              onClick={() => router.push(`/screening/complaints`)}
              className="rounded-full bg-[#366DBD] px-6 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
            >
              ย้อนกลับ
            </button>
          </div>
        </>
      )}
        </div>
      </div>
    </>
  );
}
