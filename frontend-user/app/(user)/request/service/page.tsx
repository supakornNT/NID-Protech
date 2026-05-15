"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paperclip, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { useCustomer } from "@/hooks/useCustomer";
import { useProblemTypes } from "@/hooks/useProblemTypes";
import styles from "../request.module.css";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useSubmit } from "@/hooks/use-submit";

const CUSTOMER_ID = 1;

function RequestServicePageContent() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [identity, setIdentity] = useState<"reveal" | "anonymous">("anonymous");
  const [form, setForm] = useState({
    title: "",
    problem_type_id: "",
    detail: "",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    fetch(`http://localhost:4000/requests/detail?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm((prev) => ({
            ...prev,
            title: data.title ?? "",
            detail: data.detail ?? "",
          }));
        }
      });
  }, [searchParams]);

  const { fullName } = useCustomer(identity === "reveal" ? CUSTOMER_ID : null);
  const { data: problemTypes, loading: problemTypesLoading } =
    useProblemTypes("complaint");
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { submit } = useSubmit("/requests/service", () => {
    setShowSuccess(true);
    setSubmitted(false);
    setForm({ title: "", problem_type_id: "", detail: "" });
    setFiles([]);
  });

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!form.title || !form.problem_type_id || !form.detail) {
      return;
    }

    const formData = new FormData();
    if (identity === "reveal") {
      formData.append("customer_id", String(CUSTOMER_ID));
    }
    formData.append("title", form.title);
    formData.append("problem_type_id", form.problem_type_id);
    formData.append("detail", form.detail);
    for (const file of files) {
      formData.append("files", file);
    }

    await submit(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <Card className={styles.card}>
        <div className="border-b px-4 pb-2 pt-6 sm:px-8">
          <h1 className="text-2xl font-bold">รายงานปัญหาเกี่ยวกับการบริการ</h1>
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
            <div className="flex flex-1 flex-col gap-1">
              <p style={{ fontSize: 16, fontWeight: 500 }}>การเปิดเผยตัวตน</p>
              <div className="flex h-9 items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="identity"
                    value="reveal"
                    checked={identity === "reveal"}
                    onChange={() => setIdentity("reveal")}
                  />
                  ระบุตัวตน
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="identity"
                    value="anonymous"
                    checked={identity === "anonymous"}
                    onChange={() => setIdentity("anonymous")}
                  />
                  ไม่ระบุตัวตน
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            <FormInput
              label="หัวข้อเรื่อง"
              placeholder="กรุณาเขียนหัวข้อเรื่อง"
              className="flex-1"
              inputClassName={`${styles.input} ${submitted && !form.title ? styles.inputError : ""}`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="flex flex-1 flex-col gap-1">
              <p style={{ fontSize: 16, fontWeight: 500 }}>หัวข้อเรื่องร้องเรียน</p>
              <select
                className={`${styles.input} ${styles.select} ${submitted && !form.problem_type_id ? styles.inputError : ""}`}
                value={form.problem_type_id}
                onChange={(e) => setForm({ ...form, problem_type_id: e.target.value })}
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
            <p style={{ fontSize: 16, fontWeight: 500 }}>รายละเอียด</p>
            <textarea
              className={`${styles.input} min-h-35 resize-none ${submitted && !form.detail ? styles.inputError : ""}`}
              placeholder="กรุณาอธิบายปัญหาที่พบ"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p style={{ fontSize: 16, fontWeight: 500 }}>แนบไฟล์</p>
            <Popover>
              <PopoverTrigger className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
                <Paperclip size={14} />
                แนบไฟล์{" "}
                {files.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                    {files.length}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">เลือกไฟล์ที่ต้องการแนบ</p>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-5 transition hover:bg-gray-50">
                    <Paperclip size={24} className="mb-1 text-gray-400" />
                    <span className="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์</span>
                    <span className="text-xs text-gray-400">
                      หรือลากไฟล์มาวางที่นี่
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) =>
                        setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
                      }
                    />
                  </label>
                  {files.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {files.map((file, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-600"
                        >
                          <span className="truncate">{file.name}</span>
                          <button
                            onClick={() =>
                              setFiles((prev) => prev.filter((_, j) => j !== i))
                            }
                            className="ml-2 shrink-0 text-gray-400 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-gray-400">
                    รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end px-8 pb-6">
          <button className={styles.button} onClick={handleSubmit}>
            ส่ง
          </button>
        </div>
      </Card>

      <SuccessDialog open={showSuccess} onClose={() => router.push("/home")} />
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
