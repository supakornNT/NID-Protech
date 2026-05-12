"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { useProblemTypes } from "@/hooks/useProblemTypes";
import { useCustomer } from "@/hooks/useCustomer";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useSystems } from "@/hooks/useSystems";
import styles from "../report.module.css";
import { useRouter } from "next/navigation";
import { useSubmit } from "@/hooks/useSubmit";

//เเล้วเดี๋ยวค่อย log
const CUSTOMER_ID = 1;

export default function ReportInternalPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
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
  const currentOrg = organizations.find(
    (o) => o.id === customer?.organization_id,
  );
  const { submit, loading, error } = useSubmit("/reports/internal", () => {
    alert("ส่งรายงานสำเร็จ");
  });

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("customer_id", "1");
    formData.append("organization", currentOrg?.name ?? "");
    formData.append("title", form.title);
    formData.append("problem_type_id", form.problem_type_id);
    formData.append("system_id", form.system_id);
    formData.append("detail", form.detail);
    if (date) formData.append("resolve_due_at", date.toISOString());
    for (const file of files) {
      formData.append("files", file);
    }

    await submit(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <Card className={styles.card}>
        <div className="px-4 sm:px-8 pt-6 pb-2 border-b">
          <h1 className="text-2xl font-bold">
            รายงานปัญหาเกี่ยวกับระบบภายในองค์กร
          </h1>
        </div>

        <div className="px-4 sm:px-8 py-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-6">
            <FormInput
              label="ผู้แจ้ง"
              placeholder="กำลังโหลด..."
              className="flex-1"
              inputClassName={`${styles.input} bg-gray-50 cursor-not-allowed`}
              value={fullName}
              disabled
            />
            <FormInput
              label="หน่วยงาน"
              className="flex-1"
              inputClassName={`${styles.input} bg-gray-50 cursor-not-allowed`}
              value={currentOrg?.name ?? "กำลังโหลด..."}
              disabled
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <FormInput
              label="หัวข้อเรื่อง"
              placeholder="กรุณาเขียนหัวข้อเรื่อง"
              className="flex-1"
              inputClassName={styles.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* ประเภทปัญหา — dropdown */}
            <div className="flex flex-col gap-1 flex-1">
              <p style={{ fontSize: 16, fontWeight: 500 }}>ประเภทปัญหา</p>
              <select
                className={`${styles.input} ${styles.select}`}
                value={form.problem_type_id}
                onChange={(e) =>
                  setForm({ ...form, problem_type_id: e.target.value })
                }
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

            <div className="flex flex-col gap-1 flex-1">
              <p style={{ fontSize: 16, fontWeight: 500 }}>ระบบ</p>
              <select
                className={`${styles.input} ${styles.select}`}
                value={form.system_id}
                onChange={(e) =>
                  setForm({ ...form, system_id: e.target.value })
                }
                disabled={!customer?.organization_id}
              >
                <option value="">
                  {customer?.organization_id
                    ? "กรุณาเลือกระบบ"
                    : "กำลังโหลด..."}
                </option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <p style={{ fontSize: 16, fontWeight: 500 }}>ระยะเวลา</p>
              <Popover>
                <PopoverTrigger
                  className={`${styles.input} flex items-center gap-2 w-full`}
                >
                  <CalendarIcon size={14} className="text-gray-400" />
                  <span className={date ? "text-black" : "text-gray-400"}>
                    {date
                      ? date.toLocaleDateString("th-TH")
                      : "กรุณาเลือกวันที่"}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border"
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="flex flex-col gap-1">
            <p style={{ fontSize: 16, fontWeight: 500 }}>รายละเอียด</p>
            <textarea
              className={`${styles.input} min-h-35 resize-none`}
              placeholder="กรุณาอธิบายปัญหาที่พบ"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
          </div>

          {/* แนบไฟล์ */}
          <div className="flex flex-col gap-2">
            <p style={{ fontSize: 16, fontWeight: 500 }}>แนบไฟล์</p>
            <Popover>
              <PopoverTrigger className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-fit">
                <Paperclip size={14} />
                แนบไฟล์{" "}
                {files.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                    {files.length}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">เลือกไฟล์ที่ต้องการแนบ</p>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-5 cursor-pointer hover:bg-gray-50 transition">
                    <Paperclip size={24} className="text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">
                      คลิกเพื่อเลือกไฟล์
                    </span>
                    <span className="text-xs text-gray-400">
                      หรือลากไฟล์มาวางที่นี่
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setFiles((prev) => [
                          ...prev,
                          ...Array.from(e.target.files ?? []),
                        ])
                      }
                    />
                  </label>
                  {files.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {files.map((file, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded"
                        >
                          <span className="truncate">📄 {file.name}</span>
                          <button
                            onClick={() =>
                              setFiles((prev) => prev.filter((_, j) => j !== i))
                            }
                            className="text-gray-400 hover:text-red-500 ml-2 shrink-0"
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
    </div>
  );
}
