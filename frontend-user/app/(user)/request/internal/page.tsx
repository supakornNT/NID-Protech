"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paperclip, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { useProblemTypes } from "@/hooks/useProblemTypes";
import { useCustomer } from "@/hooks/useCustomer";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useSystems } from "@/hooks/useSystems";
import styles from "../request.module.css";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useSubmit } from "@/hooks/useSubmit";

const CUSTOMER_ID = 1;

export default function RequestInternalPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    problem_type_id: "",
    system_id: "",
    detail: "",
  });

  const { data: customer, fullName } = useCustomer(CUSTOMER_ID);
  const { data: problemTypes, loading: problemTypesLoading } =
    useProblemTypes("issue");
  const { data: organizations } = useOrganizations();
  const { data: systems } = useSystems(customer?.organization_id ?? null);
  const currentOrg = organizations.find((o) => o.id === customer?.organization_id);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { submit } = useSubmit("/requests/internal", () => {
    setShowSuccess(true);
    setSubmitted(false);
    setForm({ title: "", problem_type_id: "", system_id: "", detail: "" });
    setFiles([]);
  });

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!form.title || !form.problem_type_id || !form.system_id || !form.detail) {
      return;
    }

    const formData = new FormData();
    formData.append("customer_id", "1");
    formData.append("organization", currentOrg?.name ?? "");
    formData.append("title", form.title);
    formData.append("problem_type_id", form.problem_type_id);
    formData.append("system_id", form.system_id);
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
          <h1 className="text-2xl font-bold">รายงานปัญหาเกี่ยวกับระบบภายในองค์กร</h1>
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
            <FormInput
              label="หน่วยงาน"
              className="flex-1"
              inputClassName={`${styles.input} cursor-not-allowed bg-gray-50`}
              value={currentOrg?.name ?? "กำลังโหลด..."}
              disabled
            />
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
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1">
              <p style={{ fontSize: 16, fontWeight: 500 }}>ประเภทปัญหา</p>
              <select
                className={`${styles.input} ${styles.select} ${submitted && !form.problem_type_id ? styles.inputError : ""}`}
                value={form.problem_type_id}
                onChange={(e) => setForm({ ...form, problem_type_id: e.target.value })}
                disabled={problemTypesLoading}
              >
                <option value="">กรุณาเลือกประเภทปัญหา</option>
                {problemTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <p style={{ fontSize: 16, fontWeight: 500 }}>ระบบ</p>
              <select
                className={`${styles.input} ${styles.select} ${submitted && !form.system_id ? styles.inputError : ""}`}
                value={form.system_id}
                onChange={(e) => setForm({ ...form, system_id: e.target.value })}
                disabled={!customer?.organization_id}
              >
                <option value="">
                  {customer?.organization_id ? "กรุณาเลือกระบบ" : "กำลังโหลด..."}
                </option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
