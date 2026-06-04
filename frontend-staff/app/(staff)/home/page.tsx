"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

import { useStaffSession } from "@/contexts/staff-session-context";

function withBasePath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  if (!basePath || basePath === "/") {
    return path;
  }

  const normalizedBasePath = basePath.startsWith("/")
    ? basePath
    : `/${basePath}`;

  return `${normalizedBasePath}${path}`;
}

export default function HomePage() {
  const [time, setTime] = useState<Date | null>(null);
  const { staff } = useStaffSession();
  const staffName = staff?.name ?? "สมชาย ใจดี";

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const timeStr = time
    ? `${pad(time.getHours())} : ${pad(time.getMinutes())} : ${pad(time.getSeconds())}`
    : "-- : -- : --";

  return (
    <div className="flex flex-1 flex-col gap-8 bg-[#E3EDFD] px-32 py-10">
      <div className="relative w-full overflow-hidden" style={{ minHeight: 560 }}>
        <div className="absolute right-0 top-0 h-full w-[60%]">
          <Image
            src={withBasePath("/home-illustration.png")}
            alt="illustration"
            fill
            className="object-contain object-right"
            priority
          />
        </div>

        <span className="pointer-events-none absolute right-[44%] top-10 select-none text-2xl text-[#93B4DF]">✧</span>
        <span className="pointer-events-none absolute right-[36%] bottom-8 select-none text-base text-[#93B4DF]">✧</span>
        <span className="pointer-events-none absolute right-[50%] bottom-20 select-none text-xs text-[#93B4DF]">✧</span>

        <div className="relative z-10 flex flex-col gap-3">
          <div
            className="flex flex-col items-center justify-center rounded-full bg-white shadow-lg"
            style={{ width: 360, height: 360 }}
          >
            <p className="text-5xl font-normal text-gray-900">ยินดีต้อนรับ</p>
            <p className="mt-3 text-5xl font-bold text-[#3670BF]">{staffName}</p>
          </div>

          <div className="space-y-2 pl-1">
            <p className="text-base text-[#8B95A7]">เข้าสู่ระบบ ProTech Support</p>
            <p className="text-base font-bold leading-8 text-gray-900">
              ระบบรับแจ้งปัญหา ประเด็นการใช้งาน/ข้อร้องเรียน
              <br />
              การให้บริการ เพื่อการทำงานของคุณง่ายและรวดเร็วขึ้น
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <p className="mb-4 font-semibold text-gray-900">ติดต่อผู้ดูแลระบบ</p>
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>โทร 0 2005 5069</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>info@nidprotech.com</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <p className="mb-4 font-semibold text-gray-900">ข้อมูลระบบ</p>
          <div className="space-y-1 text-sm text-gray-500">
            <p>ProTech Support เวอร์ชัน 1.0</p>
            <p>ระบบสำหรับจัดการแจ้งปัญหา</p>
            <p>และติดตามงานบริการภายในองค์กร</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <p className="mb-4 font-semibold text-gray-900">เวลาปัจจุบัน</p>
          <p className="text-3xl font-bold text-[#3670BF]">{timeStr}</p>
        </div>
      </div>
    </div>
  );
}
