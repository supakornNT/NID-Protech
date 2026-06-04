"use client";

import { FileAttachZone } from "@/components/ui/file-attach-zone";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { useProblemTypes } from "@/hooks/use-problem-types";
import { useCustomer } from "@/hooks/use-customer";
import { useOrganizations } from "@/hooks/use-organizations";
import { useSystems } from "@/hooks/use-systems";
import styles from "../request.module.css";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useSubmit } from "@/hooks/use-submit";
import { useUserSession } from "@/contexts/user-session-context";

export default function RequestInternalPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    problem_type_id: "",
    system_id: "",
    detail: "",
  });
  const { user } = useUserSession();
  const customerId = useMemo(() => {
    const userId = Number(user?.id);
    return Number.isFinite(userId) && userId > 0 ? userId : null;
  }, [user?.id]);

  const { data: customer, fullName } = useCustomer(customerId);
  const { data: problemTypes, loading: problemTypesLoading } =
    useProblemTypes("issue");
  const { data: organizations } = useOrganizations();
  const { data: systems } = useSystems(customer?.organization_id ?? null);
  const currentOrg = organizations.find((o) => o.id === customer?.organization_id);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const { submit, loading, error } = useSubmit("/requests/internal", () => {
    setShowSuccess(true);
    setSubmitted(false);
    setForm({ title: "", problem_type_id: "", system_id: "", detail: "" });
    setFiles([]);
  });

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!form.title || !form.problem_type_id || !form.system_id || !form.detail) {
      setValidationMsg("กรุณากรอกข้อมูลที่จำเป็นทั้งหมด");
      return;
    }
    setValidationMsg("");

    const formData = new FormData();
    if (customerId) {
      formData.append("customer_id", String(customerId));
    }
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
          <h1 className="text-xl font-bold sm:text-2xl">รายงานปัญหาเกี่ยวกับระบบภายในองค์กร</h1>
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
              required
              placeholder="กรุณาเขียนหัวข้อเรื่อง"
              className="flex-1"
              inputClassName={`${styles.input} ${submitted && !form.title ? styles.inputError : ""}`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-medium sm:text-base">
                ประเภทปัญหา <span className="text-red-500">*</span>
              </p>
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
              <p className="text-sm font-medium sm:text-base">
                ระบบ <span className="text-red-500">*</span>
              </p>
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
