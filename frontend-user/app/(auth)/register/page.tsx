"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import styles from "../auth.module.css";
import { FormInputIcon } from "@/components/ui/form-input";
import { OtpModal } from "@/components/ui/otp-modal";
import { Button } from "@/components/ui/button";
import { useRegisterOptions } from "@/hooks/use-register-options";
import { fetchJson } from "@/lib/fetch";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { setStoredUserSession } from "@/lib/user-session";

type UserType = "person" | "company";
const OTP_LENGTH = 5;

function keepDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhoneInput(value: string) {
  const digits = keepDigitsOnly(value).slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatCitizenIdInput(value: string) {
  const digits = keepDigitsOnly(value).slice(0, 13);

  if (digits.length <= 1) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  }

  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidThaiCitizenId(value: string) {
  if (!/^\d{13}$/.test(value)) {
    return false;
  }

  const sum = value
    .slice(0, 12)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (13 - index), 0);
  const checkDigit = (11 - (sum % 11)) % 10;

  return checkDigit === Number(value[12]);
}

function validatePassword(password: string, confirmPassword: string) {
  if (!password) {
    return "กรุณากรอกรหัสผ่าน";
  }

  if (password.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัว";
  }

  if (!/[A-Z]/.test(password)) {
    return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่";
  }

  if (!/[a-z]/.test(password)) {
    return "รหัสผ่านต้องมีตัวพิมพ์เล็ก";
  }

  if (!/\d/.test(password)) {
    return "รหัสผ่านต้องมีตัวเลข";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "รหัสผ่านต้องมีอักษรพิเศษ";
  }

  if (password !== confirmPassword) {
    return "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน";
  }

  return null;
}

const MOCK_FORM = {
  prefix_id: "",
  citizen_id: "1-1101-70001-23-4",
  first_name: "ทดสอบ",
  last_name: "ระบบ",
  phone: "081-234-5678",
  email: "test@example.com",
  password: "Test@1234",
  confirm_password: "Test@1234",
  organization_id: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("person");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    prefix_id: "",
    citizen_id: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    organization_id: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);


  const { data: registerOptions, loading: optionsLoading } = useRegisterOptions();
  const { prefixes, organizations } = registerOptions;

  function fillMock() {
    setForm({
      ...MOCK_FORM,
      prefix_id: prefixes[0]?.id?.toString() ?? "",
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const user = await fetchJson<{ organizationId: number | null }>(
          "/auth/me/customer",
          {
            skipSessionExpiredEvent: true,
          },
        );

        if (cancelled) {
          return;
        }

        setStoredUserSession(user);
        router.replace("/home");
      } catch {
        if (cancelled) {
          return;
        }

        setCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function validate() {
    const citizenDigits = keepDigitsOnly(form.citizen_id);
    const phoneDigits = keepDigitsOnly(form.phone);
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!form.prefix_id) return "กรุณาเลือกคำนำหน้า";
    if (!form.first_name.trim()) return "กรุณากรอกชื่อ";
    if (!form.last_name.trim()) return "กรุณากรอกนามสกุล";
    if (citizenDigits && !isValidThaiCitizenId(citizenDigits))
      return "กรุณากรอกเลขบัตรประชาชนให้ถูกต้อง";
    if (!phoneDigits) return "กรุณากรอกเบอร์โทร";
    if (!phoneDigits.startsWith("0")) return "รูปแบบเบอร์ไม่ถูกต้อง";
    if (phoneDigits.length !== 10) return "กรุณากรอกเบอร์โทร 10 หลัก";
    if (!normalizedEmail) return "กรุณากรอกอีเมล";
    if (!isValidEmail(normalizedEmail)) return "กรุณากรอกอีเมลให้ถูกต้อง";

    const passwordValidation = validatePassword(
      form.password,
      form.confirm_password,
    );

    if (passwordValidation) return passwordValidation;

    if (userType === "company" && !form.organization_id)
      return "กรุณาเลือกหน่วยงาน";
    return null;
  }

  function validateOtp() {
    if (otp.length !== OTP_LENGTH) return `กรุณากรอก OTP ให้ครบ ${OTP_LENGTH} หลัก`;
    return null;
  }
  //ใช้เเค่ตอน submit ของ register
  async function handleSubmit() {
    setSubmitted(true);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setShowOtpModal(true);
  }

  async function handleOtpConfirm() {
    const err = validateOtp();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix_id: form.prefix_id ? Number(form.prefix_id) : null,
          citizen_id: keepDigitsOnly(form.citizen_id) || null,
          name: form.first_name.trim(),
          surname: form.last_name.trim(),
          phone: keepDigitsOnly(form.phone),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          otp,
          customer_type: userType,
          organization_id: userType === "company" ? Number(form.organization_id) : null,
        }),
      });
      setShowOtpModal(false);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col px-4 sm:px-8 py-6 sm:py-10"
      style={{ background: "#F8F9FB" }}
    >
      <div className="w-full max-w-5xl mx-auto relative flex justify-center items-center mb-6">
        <button
          onClick={() => router.push("/login")}
          className="absolute left-0 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#366DBD]">การลงทะเบียน</h1>
          <p className="text-l text-[#929396] mt-2">
            กรุณาลงทะเบียนก่อนเพื่อเข้าสู่ระบบ
          </p>
          {process.env.NODE_ENV === "development" && (
            <button
              type="button"
              onClick={fillMock}
              className="mt-2 text-xs text-gray-400 underline hover:text-gray-600"
            >
              [DEV] กรอกข้อมูลทดสอบ
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8 mb-6 w-full max-w-5xl mx-auto">
        <label
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setUserType("person")}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 21,
              border: "1px solid #000",
              borderRadius: 100,
              background: "#fff",
            }}
          >
            {userType === "person" && (
              <div
                style={{
                  width: 15,
                  height: 14,
                  background: "#366DBD",
                  border: "1px solid #366DBD",
                  borderRadius: 100,
                }}
              />
            )}
          </div>
          <span style={{ fontSize: 20, color: "#366DBD" }}>บุคคลทั่วไป</span>
        </label>

        <label
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setUserType("company")}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 21,
              border: "1px solid #000",
              borderRadius: 100,
              background: "#fff",
            }}
          >
            {userType === "company" && (
              <div
                style={{
                  width: 15,
                  height: 14,
                  background: "#366DBD",
                  border: "1px solid #366DBD",
                  borderRadius: 100,
                }}
              />
            )}
          </div>
          <span style={{ fontSize: 20, color: "#366DBD" }}>ลูกค้าบริษัท</span>
        </label>
      </div>

      <div
        className="w-full max-w-5xl flex flex-col gap-5 px-4 sm:px-10 py-6 sm:py-8 mx-auto"
        style={{
          background: "#F1F6FD",
          boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
          borderRadius: 30,
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>
          ข้อมูลส่วนตัว
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[120px_1fr_1fr]">
          <div className="flex flex-col gap-1">
            <p style={{ fontSize: 16, fontWeight: 500 }}>คำนำหน้า</p>
            <div className="relative">
              <select
                className={`peer ${styles.input} w-full appearance-none pr-10`}
                value={form.prefix_id}
                onChange={(e) => {
                  setForm({ ...form, prefix_id: e.target.value });
                }}
                disabled={optionsLoading}
              >
                <option value="">คำนำหน้า</option>
                {prefixes.map((prefix) => (
                  <option key={prefix.value} value={prefix.value}>
                    {prefix.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#6B7280] transition-transform duration-200 peer-data-[open=true]:rotate-180"
              />
            </div>
          </div>
          <FormInput
            label="ชื่อ"
            placeholder="กรุณากรอกชื่อ"
            inputClassName={`${styles.input} ${submitted && !form.first_name ? "border-red-500" : ""}`}
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <FormInput
            label="นามสกุล"
            placeholder="กรุณากรอกนามสกุล"
            inputClassName={`${styles.input} ${submitted && !form.last_name ? "border-red-500" : ""}`}
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </div>
        <div>
          <FormInput
            label="เลขบัตรประชาชน"
            placeholder="1-2345-67890-12-3"
            maxLength={17}
            inputClassName={`${styles.input} ${submitted && form.citizen_id && !isValidThaiCitizenId(keepDigitsOnly(form.citizen_id)) ? "border-red-500" : ""}`}
            value={form.citizen_id}
            onChange={(e) => {
              setForm({
                ...form,
                citizen_id: formatCitizenIdInput(e.target.value),
              });
            }}
          />
        </div>

        <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>
          ช่องทางการติดต่อ
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <FormInput
            label="เบอร์โทร"
            placeholder="กรุณากรอกเบอร์โทร"
            className="flex-1"
            type="tel"
            maxLength={12}
            inputClassName={`${styles.input} ${submitted && !form.phone ? "border-red-500" : ""}`}
            value={form.phone}
            onChange={(e) => {
              setForm({ ...form, phone: formatPhoneInput(e.target.value) });
            }}
          />
          <FormInput
            label="อีเมล"
            placeholder="กรุณากรอกอีเมล"
            className="flex-1"
            inputClassName={`${styles.input} ${submitted && !form.email ? "border-red-500" : ""}`}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>
          ตั้งค่าเข้าสู่ระบบ
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <FormInputIcon
            label="รหัสผ่าน"
            placeholder="กรุณากรอกรหัสผ่าน"
            className="flex-1"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type={showPassword ? "text" : "password"}
            inputClassName={submitted && !form.password ? "border-red-500" : ""}
            icon={<Lock size={16} className="text-gray-400" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={16} className="text-gray-400" />
                ) : (
                  <Eye size={16} className="text-gray-400" />
                )}
              </button>
            }
          />
          <FormInputIcon
            label="ยืนยันรหัสผ่าน"
            placeholder="กรุณากรอกรหัสผ่านอีกครั้ง"
            className="flex-1"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
            type={showConfirmPassword ? "text" : "password"}
            inputClassName={
              submitted && !form.confirm_password ? "border-red-500" : ""
            }
            icon={<Lock size={16} className="text-gray-400" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} className="text-gray-400" />
                ) : (
                  <Eye size={16} className="text-gray-400" />
                )}
              </button>
            }
          />
        </div>
        <p className="text-sm text-gray-400">
          รหัสผ่านต้องประกอบด้วย ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักษรพิเศษ
          อย่างน้อย 8 ตัว
        </p> 

        {userType === "company" && (
          <>
            <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>
              หน่วยงาน
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-1 flex-1">
                <p style={{ fontSize: 16, fontWeight: 500 }}>เลือกหน่วยงาน</p>
                <select
                  className={styles.input}
                  value={form.organization_id}
                  onChange={(e) =>
                    setForm({ ...form, organization_id: e.target.value })
                  }
                  disabled={optionsLoading}
                >
                  <option value="">กรุณาเลือกหน่วยงาน</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1" />
            </div>
          </>
        )}

        {error ? (
          <p className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end items-center gap-6 px-5">
          <Button
            className="bg-[#2F66C5] w-fit rounded-md"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "กำลังดำเนินการ..." : "ยืนยันการลงทะเบียน"}
          </Button>
        </div>
      </div>
      <OtpModal
        open={showOtpModal}
        email={form.email.trim().toLowerCase()}
        otp={otp}
        onOtpChange={setOtp}
        onConfirm={handleOtpConfirm}
        onClose={() => { setShowOtpModal(false); setError(""); setOtp(""); }}
        loading={loading}
        error={showOtpModal ? error : undefined}
      />
      <SuccessDialog
        open={showSuccess}
        title="ลงทะเบียนสำเร็จ!"
        description="บัญชีของคุณถูกสร้างแล้ว กรุณาเข้าสู่ระบบ"
        onClose={() => router.push("/login")}
      />
    </div>
  );
}
