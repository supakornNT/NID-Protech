"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Paperclip, X } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import styles from "../report.module.css";

export default function ReportServicePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [identity, setIdentity] = useState<"reveal" | "anonymous">("anonymous");

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
              placeholder="กรุณาใส่ชื่อผู้แจ้งปัญหา"
              className="flex-1"
              inputClassName={styles.input}
            />
            <div className="flex flex-col gap-1 flex-1">
              <p style={{ fontSize:16, fontWeight: 500 }}>การเปิดเผยตน</p>
              <div className="flex items-center gap-4 h-9">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="identity"
                    value="reveal"
                    checked={identity === "reveal"}
                    onChange={() => setIdentity("reveal")}
                  />
                  ระบุตัวตน
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
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

          <div className="flex gap-6">
            <FormInput
              label="หัวข้อเรื่อง"
              placeholder="กรุณาเขียนหัวข้อเรื่อง"
              className="flex-1"
              inputClassName={styles.input}
            />
            <FormInput
              label="หัวข้อเรื่องร้องเรียน"
              placeholder="กรุณาเลือกหัวข้อเรื่องร้องเรียน"
              className="flex-1"
              inputClassName={styles.input}
            />
          </div>

          <div className="flex flex-col gap-1">
            <p style={{ fontSize:16, fontWeight: 500 }}>รายละเอียด</p>
            <textarea
              className={`${styles.input} min-h-35 resize-none`}
              placeholder="กรุณาอธิบายปัญหาที่พบ"
            />
          </div>

          {/* แนบไฟล์ */}
          <div className="flex flex-col gap-2">
            <p style={{ fontSize:16, fontWeight: 500 }}>แนบไฟล์</p>
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
          <button className={styles.button}>ส่ง</button>
        </div>
      </Card>
    </div>
  );
}
