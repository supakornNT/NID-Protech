"use client";

import { Lock, Mail, EyeOff, Plus } from "lucide-react";

import { ProTechButton } from "@/components/tables/protech-button";

export function TeamRegistrationForm() {
  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          จัดการข้อมูลลงทะเบียนทีมแก้ไขประเด็น
        </h1>
        <p className="mt-3 text-[16px] text-[#8B95A7]">
          การจัดการข้อมูลลงทะเบียนของทีมแก้ไขประเด็น
        </p>
      </div>

      <div className="rounded-[28px] bg-[#E8EFFB] px-8 py-7">
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-8">
            <FormSection title="ข้อมูลผู้ใช้งาน">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="ชื่อ" placeholder="กรุณากรอกชื่อ" />
                <Field label="นามสกุล" placeholder="กรุณากรอกนามสกุล" />
              </div>
            </FormSection>

            <FormSection title="กลุ่มและสิทธิ์การทำงาน">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <label className="mb-2 block text-[16px] font-medium text-[#111827]">
                    กลุ่ม
                  </label>
                  <div className="flex items-center gap-3">
                    <Field placeholder="กรุณาเลือกกลุ่ม" noLabel />
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6E8FD4] text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[16px] font-semibold text-[#3A6FCF]">
                    สิทธิ์
                  </p>
                  <div className="flex flex-wrap gap-6">
                    {["Screening", "Assign", "Operator"].map((item, index) => (
                      <label
                        key={item}
                        className="flex items-center gap-3 text-[16px] text-[#111827]"
                      >
                        <span
                          className={`h-6 w-6 rounded-full border ${
                            index === 2
                              ? "border-[#2F66C5] bg-[#2F66C5]"
                              : "border-[#111827] bg-white"
                          }`}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="ช่องทางการติดต่อ">
              <div className="space-y-5">
                <Field label="เบอร์โทร" placeholder="กรุณากรอกเบอร์โทร" />
                <Field
                  label="อีเมล"
                  placeholder="กรุณากรอกอีเมล"
                  icon={<Mail size={22} />}
                />
              </div>
            </FormSection>
          </div>

          <div className="space-y-8">
            <FormSection title="ตั้งค่าเข้าสู่ระบบ">
              <div className="space-y-5">
                <Field
                  label="รหัสผ่าน"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  icon={<Lock size={22} />}
                />
                <Field
                  label="ตรวจสอบรหัสผ่าน"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  icon={<EyeOff size={22} />}
                />
              </div>
            </FormSection>

            <FormSection title="ยืนยันตัวตน">
              <div className="space-y-4">
                <label className="block text-[16px] font-medium text-[#111827]">
                  OTP
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-9 w-9 rounded-xl border border-[#A8B1C2] bg-white"
                    />
                  ))}
                  <button
                    type="button"
                    className="rounded-xl bg-[#9CC0FF] px-6 py-2 text-[16px] text-white"
                  >
                    ส่ง OTP
                  </button>
                </div>
                <p className="pl-32 text-[16px] text-[#8B95A7]">เหลือเวลา 00:29</p>
              </div>
            </FormSection>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <ProTechButton
            variant="primary"
            className="h-14 min-w-[300px] rounded-2xl text-[20px]"
          >
            ยืนยันการลงทะเบียน
          </ProTechButton>
        </div>
      </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-[16px] font-semibold text-[#3A6FCF] underline underline-offset-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  placeholder,
  icon,
  noLabel = false,
}: {
  label?: string;
  placeholder: string;
  icon?: React.ReactNode;
  noLabel?: boolean;
}) {
  return (
    <div className="space-y-2">
      {!noLabel && label && (
        <label className="block text-[16px] font-medium text-[#111827]">
          {label}
        </label>
      )}
      <div className="flex h-14 items-center rounded-2xl border border-[#A8B1C2] bg-white px-4">
        {icon && <span className="mr-3 text-[#111827]">{icon}</span>}
        <span className="text-[16px] text-[#9CA3AF]">{placeholder}</span>
      </div>
    </div>
  );
}
