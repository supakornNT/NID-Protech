"use client";
import { Card } from "@/components/ui/card";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import styles from "@/app/(auth)/auth.module.css";
import { FormInputIcon } from "@/components/ui/form-input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  return (
    <div className="flex justify-center py-4 sm:py-8 px-4 sm:px-0">
      <Card className={`${styles.cardBackground} shadow-none border-0 bg-transparent md:shadow-md md:border md:bg-white`}>
        {/* Left Panel — ซ่อนบนมือถือ แสดงบน md ขึ้นไป */}
        <div className="hidden md:block flex-1">
        <div className={styles.leftPanel} style={{ height: "100%" }}>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
          <div className={styles.leftLogo}>
            <Image src="/ProTechLogoFinal.png" alt="ProTech Support" width={160} height={48} style={{ objectFit: "contain" }} />
          </div>
          <div className={styles.leftContent}>
            <h2 className={styles.leftTitle}>
              ระบบจัดการงาน<br />
              <span className={styles.leftTitleAccent}>ซ่อมบำรุงและบริการ</span>
            </h2>
            <p className={styles.leftDesc}>
              แจ้งปัญหา ติดตามงาน บริการรวดเร็ว<br />
              เชื่อมต่อทุกการซ่อมบำรุงอย่างมืออาชีพ
            </p>
            <div className={styles.leftIllustration}>
              <Image src="/man.png" alt="illustration" width={370} height={184} style={{ objectFit: "contain", width: "100%", height: "auto" }} />
            </div>
          </div>
        </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Card className={styles.cardMain}>
            <div className="flex flex-col items-center gap-2">
              <div className="flex justify-center w-full">
                <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
              </div>
              <div className="flex justify-center w-full">
                <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อเข้าใช้งาน</p>
              </div>
            </div>
            <div className="flex justify-center items-center gap-6 px-5">
              <FormInputIcon
                label="อีเมล"
                placeholder="กรุณากรอกอีเมล"
                className="flex-1"
                icon={<Mail size={16} className="text-gray-400" />}
              />
            </div>
            <div className="flex justify-center items-center gap-6 px-5">
              <FormInputIcon
                label="รหัสผ่าน"
                placeholder="กรุณากรอกรหัสผ่าน"
                className="flex-1"
                type={showPassword ? "text" : "password"}
                icon={<Lock size={16} className="text-gray-400" />}
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                  </button>
                }
              />
            </div>
            <div className="flex justify-center items-center gap-6 px-5">
              <Button className="bg-[#2F66C5] hover:bg-[#1a56b0] w-full rounded-md">เข้าสู่ระบบ</Button>
            </div>
            <div className="flex items-center gap-3 px-5">
              <hr className="flex-1 border-gray-400" />
              <span className="text-sm text-black">หรือ</span>
              <hr className="flex-1 border-gray-400" />
            </div>
            <div className="flex justify-center items-center gap-6 px-5">
              <Button className="bg-[#ffffff] hover:bg-gray-100 w-full rounded-md text-black border-black" onClick={() => router.push("/register")}>
                สมัครสมาชิก
              </Button>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
