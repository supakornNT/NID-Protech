"use client";

import { FileAttachZone } from "@/components/ui/file-attach-zone";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { useCustomer } from "@/hooks/use-customer";
import { useProblemTypes } from "@/hooks/use-problem-types";
import { useUserSession } from "@/contexts/user-session-context";
import styles from "../request.module.css";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useSubmit } from "@/hooks/use-submit";
import { fetchJson } from "@/lib/fetch";
import { useLoadingDelay } from "@/hooks/use-loading-delay";

function RequestServicePageContent() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    problem_type_id: "",
    detail: "",
  });
  const { user } = useUserSession();
  const customerId = useMemo(() => {
    const userId = Number(user?.id);
    return Number.isFinite(userId) && userId > 0 ? userId : null;
  }, [user?.id]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    fetchJson<{ title?: string; detail?: string }>(`/requests/detail?id=${id}`)
      .then((data) => {
        if (data) {
          setForm((prev) => ({
            ...prev,
            title: data.title ?? "",
            detail: data.detail ?? "",
          }));
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const { fullName } = useCustomer(customerId);
  const { data: problemTypes, loading: problemTypesLoading } =
    useProblemTypes("complaint");
  const showSkeleton = useLoadingDelay(problemTypesLoading);
  const [submitted, setSubmitted] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { submit, loading, error } = useSubmit("/requests/service", () => {
    setShowSuccess(true);
    setSubmitted(false);
    setForm({ title: "", problem_type_id: "", detail: "" });
    setFiles([]);
  });

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!form.title || !form.problem_type_id || !form.detail) {
      setValidationMsg("กรุณากรอกข้อมูลที่จำเป็นทั้งหมด");
      return;
    }
    setValidationMsg("");

    const formData = new FormData();
    if (customerId) {
      formData.append("customer_id", String(customerId));
    }
    formData.append("title", form.title);
    formData.append("problem_type_id", form.problem_type_id);
    formData.append("detail", form.detail);
    for (const file of files) {
      formData.append("files", file);
    }

    await submit(formData);
  };

  if (showSkeleton) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
        <Card className={styles.card}>
          <div className="animate-pulse">
            {/* Title bar */}
            <div className="border-b px-4 pb-2 pt-6 sm:px-8">
              <div className="h-7 w-3/4 rounded-lg bg-gray-200" />
            </div>

            <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
              {/* Row 1: ผู้แจ้ง */}
              <div className="flex flex-col gap-1">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-10 rounded-lg bg-gray-200" />
              </div>

              {/* Row 2: หัวข้อเรื่อง + หัวข้อเรื่องร้องเรียน */}
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-10 rounded-lg bg-gray-200" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="h-4 w-36 rounded bg-gray-200" />
                  <div className="h-10 rounded-lg bg-gray-200" />
                </div>
              </div>

              {/* Textarea: รายละเอียด */}
              <div className="flex flex-col gap-1">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-28 rounded-lg bg-gray-200 sm:h-35" />
              </div>

              {/* File attach placeholder */}
              <div className="flex flex-col gap-2">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-20 rounded-lg bg-gray-200" />
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end px-4 pb-6 sm:px-8">
              <div className="h-10 w-20 rounded-lg bg-gray-200" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <Card className={styles.card}>
        <div className="border-b px-4 pb-2 pt-6 sm:px-8">
          <h1 className="text-xl font-bold sm:text-2xl">รายงานปัญหาเกี่ยวกับการบริการ</h1>
        </div>

        <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <FormInput
              label="ผู้แจ้ง"
              placeholder="กำลังโหลด..."
              className="flex-1"
              inputClassName={`${styles.input} cursor-not-allowed bg-gray-50`}
              value={fullName}
              disabled
            />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            <FormInput
              label="หัวข้อเรื่อง"
              required
              placeholder="กรุณาเขียนหัวข้อเรื่อง"
              className="flex-1"
              inputClassName={`${styles.input} ${submitted && !form.title ? styles.inputError : ""}`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-medium sm:text-base">
                หัวข้อเรื่องร้องเรียน <span className="text-red-500">*</span>
              </p>
              <select
                className={`${styles.input} ${styles.select} ${submitted && !form.problem_type_id ? styles.inputError : ""}`}
                value={form.problem_type_id}
                onChange={(e) =>
                  setForm({ ...form, problem_type_id: e.target.value })
                }
                disabled={problemTypesLoading}
              >
                <option value="">กรุณาเลือกหัวข้อเรื่องร้องเรียน</option>
                {problemTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium sm:text-base">
              รายละเอียด <span className="text-red-500">*</span>
            </p>
            <textarea
              className={`${styles.input} min-h-28 resize-none sm:min-h-35 ${submitted && !form.detail ? styles.inputError : ""}`}
              placeholder="กรุณาอธิบายปัญหาที่พบ"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium sm:text-base">แนบไฟล์</p>
            <FileAttachZone files={files} onChange={setFiles} />
          </div>
        </div>

        {error ? <p className="px-4 pb-2 text-sm text-red-600 sm:px-8">{error}</p> : null}
        {loading ? <p className="px-4 pb-2 text-sm text-[#3A6FCF] sm:px-8">กำลังส่งข้อมูล...</p> : null}
        {validationMsg && <p className="px-4 pb-2 text-sm text-red-500 sm:px-8">{validationMsg}</p>}

        <div className="flex justify-end px-4 pb-6 sm:px-8">
          <button className={styles.button} onClick={handleSubmit} disabled={loading}>
            {loading ? "กำลังส่ง..." : "ส่ง"}
          </button>
        </div>
      </Card>

      <SuccessDialog open={showSuccess} onClose={() => router.push("/track")} />
    </div>
  );
}

export default function RequestServicePage() {
  return (
    <Suspense fallback={null}>
      <RequestServicePageContent />
    </Suspense>
  );
}
