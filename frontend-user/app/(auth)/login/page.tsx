"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Card } from "@/components/ui/card";
import { FormInputIcon } from "@/components/ui/form-input";
import { ProTechButton } from "@/components/tables/protech-button";
import { fetchJson } from "@/lib/fetch";
import {
  clearStoredUserSession,
  setStoredUserSession,
} from "@/lib/user-session";
import styles from "@/app/(auth)/auth.module.css";

type LoginResponse = {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    customerType: "person" | "company";
    organizationId: number | null;
  };
};

type CustomerMeResponse = LoginResponse["user"] & {
  sessionExpiresAt: string | null;
};

function withBasePath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path}`;
}

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/home";

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const user = await fetchJson<CustomerMeResponse>("/auth/me/customer", {
          skipSessionExpiredEvent: true,
        });

        if (cancelled) {
          return;
        }

        setStoredUserSession(user);
        router.replace(nextPath);
      } catch {
        if (cancelled) {
          return;
        }

        clearStoredUserSession();
        setCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetchJson<LoginResponse>("/auth/login/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        skipSessionExpiredEvent: true,
        body: JSON.stringify({ email, password }),
      });

      setStoredUserSession(response.user);
      router.push(nextPath);
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "เข้าสู่ระบบไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className={styles.loginLoadingScreen}>
        <div className={styles.loginLoadingCard}>
          <p className={styles.loginLoadingTitle}>กำลังตรวจสอบการเข้าสู่ระบบ</p>
          <p className={styles.loginLoadingText}>กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.loginShell}>
      <section className={styles.loginBrandPanel}>
        <div className={styles.loginLogoWrap}>
          <Image
            src={withBasePath("/ProTechLogoFinal.png")}
            alt="ProTech Support"
            width={136}
            height={52}
            priority
            className={styles.loginLogo}
          />
        </div>

        <div className={styles.loginHeroContent}>
          <h1 className={styles.loginHeroTitle}>
            <span className={styles.loginHeroTitleLine}>ระบบจัดการงาน</span>
            <span
              className={`${styles.loginHeroTitleLine} ${styles.loginHeroTitleAccent}`}
            >
              ซ่อมบำรุงและบริการ
            </span>
          </h1>
          <p className={styles.loginHeroDescription}>
            แจ้งปัญหา ติดตามงาน บริการรวดเร็ว
            <br />
            เชื่อมต่อทุกการซ่อมบำรุงอย่างมืออาชีพ
          </p>
        </div>

        <div className={styles.loginIllustrationWrap}>
          <Image
            src={withBasePath("/man.png")}
            alt="illustration"
            width={624}
            height={562}
            priority
            className={styles.loginIllustration}
          />
        </div>
      </section>

      <section className={styles.loginFormPanel}>
        <Card className={styles.loginMainCard}>
          <div className={styles.loginCardBody}>
            <div className={styles.loginCardHeader}>
              <h1 className={styles.loginCardTitle}>เข้าสู่ระบบ</h1>
              <p className={styles.loginCardSubtitle}>
                กรุณาเข้าสู่ระบบเพื่อเข้าใช้งาน
              </p>
            </div>

            <form
              className={styles.loginForm}
              onSubmit={(event) => {
                void handleLogin(event);
              }}
            >
              <FormInputIcon
                label="อีเมล"
                placeholder="กรุณากรอกอีเมล"
                className={styles.loginFieldGroup}
                inputClassName={styles.loginFieldInput}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                icon={<Mail size={20} className={styles.loginFieldIcon} />}
              />

              <FormInputIcon
                label="รหัสผ่าน"
                placeholder="กรุณากรอกรหัสผ่าน"
                className={styles.loginFieldGroup}
                inputClassName={styles.loginFieldInput}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                icon={<Lock size={20} className={styles.loginFieldIcon} />}
                suffix={
                  <button
                    type="button"
                    className={styles.loginPasswordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className={styles.loginFieldIcon} />
                    ) : (
                      <Eye size={20} className={styles.loginFieldIcon} />
                    )}
                  </button>
                }
              />

              {error ? <p className={styles.loginErrorText}>{error}</p> : null}

              <ProTechButton
                type="submit"
                disabled={loading}
                fullWidth
                className={styles.loginPrimaryButton}
              >
                {loading ? "กำลังดำเนินการ..." : "เข้าสู่ระบบ"}
              </ProTechButton>

              <div className={styles.loginDivider} aria-hidden="true">
                <span className={styles.loginDividerLine} />
                <span className={styles.loginDividerText}>หรือ</span>
                <span className={styles.loginDividerLine} />
              </div>

              <ProTechButton
                type="button"
                variant="authOutline"
                fullWidth
                className={styles.loginSecondaryButton}
                onClick={() => router.push("/register")}
              >
                สมัครสมาชิก
              </ProTechButton>
            </form>
          </div>
        </Card>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.loginLoadingScreen}>
        <div className={styles.loginLoadingCard}>
          <p className={styles.loginLoadingTitle}>กำลังโหลด...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
