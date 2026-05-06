"use client";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import styles from "./system.module.css";
import { Label } from "@/components/ui/label";

export default function ReportSystemPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <Card className={styles.card}>
        {/* หัวข้อ */}
        <div className="px-8 pt-6 pb-2 border-b">
          <h1 className="text-2xl font-bold">รายงานปัญหาเกี่ยวกับระบบ</h1>
        </div>

        <div className="px-8 py-6 flex flex-col gap-5">
          <div className="flex gap-6">
            <div className="flex flex-col gap-1 flex-1">
              <Label>ผู้แจ้ง</Label>
              <Input className={styles.input} placeholder="กรุณาใส่ชื่อผู้แจ้งปัญหา" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label>หน่วยงาน</Label>
              <Input className={styles.input} placeholder="กรุณาเลือกหน่วยงาน" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>หัวข้อเรื่อง</Label>
            <Input className={styles.input} placeholder="กรุณาเขียนหัวข้อเรื่อง" />
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col gap-1 flex-1">
              <Label>ประเภทปัญหา</Label>
              <Input className={styles.input} placeholder="กรุณาเลือกประเภทปัญหา" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label>ระบบ</Label>
              <Input className={styles.input} placeholder="กรุณาเลือกระบบ" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label>ระยะเวลา</Label>
              <Popover>
                <PopoverTrigger className={`${styles.input} flex items-center gap-2 w-full`}>
                  <CalendarIcon size={14} className="text-gray-400" />
                  <span className={date ? "text-black" : "text-gray-400"}>
                    {date ? date.toLocaleDateString("th-TH") : "กรุณาเลือกวันที่"}
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
            <Label>รายละเอียด</Label>
            <textarea
              className={`${styles.input} min-h-35 resize-none`}
              placeholder="กรุณาอธิบายปัญหาที่พบ"
            />
          </div>

          {/* แนบไฟล์ */}
          <div className="flex flex-col gap-2">
            <Label>แนบไฟล์</Label>
            <Popover>
              <PopoverTrigger className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-fit">
                <Paperclip size={14} />
                แนบไฟล์ {files.length > 0 && <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">{files.length}</span>}
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">เลือกไฟล์ที่ต้องการแนบ</p>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-5 cursor-pointer hover:bg-gray-50 transition">
                    <Paperclip size={24} className="text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์</span>
                    <span className="text-xs text-gray-400">หรือลากไฟล์มาวางที่นี่</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
                      }
                    />
                  </label>
                  {files.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {files.map((file, i) => (
                        <li key={i} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                          <span className="truncate">📄 {file.name}</span>
                          <button
                            onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="text-gray-400 hover:text-red-500 ml-2 shrink-0"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-gray-400">รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>
    </div>
  );
}
