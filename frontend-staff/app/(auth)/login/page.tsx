"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import styles from "@/app/(auth)/auth.module.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInputIcon } from "@/components/ui/form-input";
import { fetchJson } from "@/lib/fetch";

type StaffSession = {
  id: number;
  email: string;
  name: string;
  modules: {
    key: string;
    label: string;
    children: {
      key: string;
      label: string;
    }[];
  }[];
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await fetchJson("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const staff = await fetchJson<StaffSession>("/auth/me", {
        cache: "no-store",
      });

      localStorage.setItem("protech_staff", JSON.stringify(staff));
      router.replace("/home");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-4 sm:px-0 sm:py-8">
      <Card
        className={`${styles.cardBackground} border-0 bg-transparent shadow-none md:border md:bg-white md:shadow-md`}
      >
        <div className="hidden flex-1 md:block">
          <div className={styles.leftPanel} style={{ height: "100%" }}>
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
            <div className={styles.leftLogo}>
              <Image
                src="/ProTechLogoFinal.png"
                alt="ProTech Support"
                width={160}
                height={48}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className={styles.leftContent}>
              <h2 className={styles.leftTitle}>
                ระบบจัดการงาน
                <br />
                <span className={styles.leftTitleAccent}>
                  ซ่อมบำรุงและบริการ
                </span>
              </h2>
              <p className={styles.leftDesc}>
                แจ้งปัญหา ติดตามงาน บริการรวดเร็ว
                <br />
                เชื่อมต่อทุกการซ่อมบำรุงอย่างมืออาชีพ
              </p>
              <div className={styles.leftIllustration}>
                <Image
                  src="/man.png"
                  alt="illustration"
                  width={370}
                  height={184}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <Card className={styles.cardMain}>
            <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2">
                <div className="flex w-full justify-center">
                  <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
                </div>
                <div className="flex w-full justify-center">
                  <p className="text-gray-500">
                    กรุณาเข้าสู่ระบบเพื่อเข้าใช้งาน
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 px-5">
                <FormInputIcon
                  label="อีเมล"
                  placeholder="กรุณากรอกอีเมล"
                  className="flex-1"
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(event) => setEmail(event.target.value)}
                  icon={<Mail size={16} className="text-gray-400" />}
                />
              </div>

              <div className="flex items-center justify-center gap-6 px-5">
                <FormInputIcon
                  label="รหัสผ่าน"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  className="flex-1"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={loading}
                  onChange={(event) => setPassword(event.target.value)}
                  icon={<Lock size={16} className="text-gray-400" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff size={16} className="text-gray-400" />
                      ) : (
                        <Eye size={16} className="text-gray-400" />
                      )}
                    </button>
                  }
                />
              </div>

              {error && (
                <p className="px-5 text-sm font-medium text-red-500">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-center gap-6 px-5">
                <Button
                  type="submit"
                  className="w-full rounded-md bg-[#2F66C5] hover:bg-[#1a56b0]"
                  disabled={loading}
                >
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </div>

              <div className="flex items-center gap-3 px-5">
                <hr className="flex-1 border-gray-400" />
                <span className="text-sm text-black">หรือ</span>
                <hr className="flex-1 border-gray-400" />
              </div>

              <div className="flex items-center justify-center gap-6 px-5">
                <Button
                  type="button"
                  className="w-full rounded-md border-black bg-[#ffffff] text-black hover:bg-gray-100"
                  onClick={() => router.push("/register")}
                  disabled={loading}
                >
                  สมัครสมาชิก
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Card>
    </div>
  );
}
