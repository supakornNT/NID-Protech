"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FileText, ImageIcon, X } from "lucide-react";
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
              <div className="border-b px-8 pt-6 pb-4">
                <h1 className="text-[22px] font-bold text-gray-900">รายละเอียดข้อร้องเรียน</h1>
              </div>

              <div className="flex flex-col gap-5 px-8 py-6">
            <div className="flex gap-6">
              <Field label="ผู้แจ้ง" value={data.customerName} />
              <Field label="ระบบ" value={data.systemName} />
            </div>

            <div className="flex gap-6">
              <Field label="หัวข้อเรื่อง" value={data.title} />
              <Field label="ประเภท" value={data.problemName} />
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
                    return (
                      <div key={file.id} className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => isImage && setLightbox(url)}
                          className={`flex min-w-0 items-center gap-3 ${isImage ? "cursor-zoom-in" : "cursor-default"}`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isImage ? "bg-blue-50" : "bg-red-50"}`}>
                            {isImage ? <ImageIcon size={20} className="text-blue-500" /> : <FileText size={20} className="text-red-500" />}
                          </div>
                          <div className="flex min-w-0 flex-col text-left">
                            <span className="truncate text-[13px] font-medium text-gray-800">{nameNoExt}</span>
                            <span className="text-[11px] text-gray-400">{ext.toUpperCase()}</span>
                          </div>
                        </button>
                        {!isImage && (
                          <a href={url} target="_blank" rel="noreferrer" className="ml-auto shrink-0 text-[12px] text-[#366DBD] hover:underline">
                            เปิด
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end px-8 pb-6">
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
