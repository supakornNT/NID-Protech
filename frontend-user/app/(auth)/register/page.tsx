"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import styles from "../auth.module.css";
import { FormInputIcon } from "@/components/ui/form-input";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { useOrganizations } from "@/hooks/useOrganizations";
import { fetchJson } from "@/lib/fetch";

type UserType = "person" | "company";

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("person");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    organization_id: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: organizations, loading: orgsLoading } = useOrganizations();

  function validate() {
    if (!form.first_name || !form.last_name) return "กรุณากรอกชื่อ-นามสกุล";
    if (!form.phone) return "กรุณากรอกเบอร์โทร";
    if (!form.email) return "กรุณากรอกอีเมล";
    if (form.password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัว";
    if (form.password !== form.confirm_password) return "รหัสผ่านไม่ตรงกัน";
    if (userType === "company" && !form.organization_id) return "กรุณาเลือกหน่วยงาน";
    if (otp.length < 6) return "กรุณากรอก OTP ให้ครบ";
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.first_name,
          surname: form.last_name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          otp,
          customer_type: userType,
          organization_id: userType === "company" ? Number(form.organization_id) : null,
        }),
      });
      router.push("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
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
        </div>
      </div>

      <div className="flex gap-8 mb-6 w-full max-w-5xl mx-auto">
        <label
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setUserType("person")}
        >
          <div
            className="flex items-center justify-center"
            style={{ width: 22, height: 21, border: "1px solid #000", borderRadius: 100, background: "#fff" }}
          >
            {userType === "person" && (
              <div style={{ width: 15, height: 14, background: "#366DBD", border: "1px solid #366DBD", borderRadius: 100 }} />
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
            style={{ width: 22, height: 21, border: "1px solid #000", borderRadius: 100, background: "#fff" }}
          >
            {userType === "company" && (
              <div style={{ width: 15, height: 14, background: "#366DBD", border: "1px solid #366DBD", borderRadius: 100 }} />
            )}
          </div>
          <span style={{ fontSize: 20, color: "#366DBD" }}>ลูกค้าบริษัท</span>
        </label>
      </div>

      <div
        className="w-full max-w-5xl flex flex-col gap-5 px-4 sm:px-10 py-6 sm:py-8 mx-auto"
        style={{ background: "#F1F6FD", boxShadow: "0px 4px 4px rgba(0,0,0,0.25)", borderRadius: 30 }}
      >
        <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>ข้อมูลส่วนตัว</p>
        <div className="flex flex-col sm:flex-row gap-6">
          <FormInput
            label="ชื่อ"
            placeholder="กรุณากรอกชื่อ"
            className="flex-1"
            inputClassName={styles.input}
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <FormInput
            label="นามสกุล"
            placeholder="กรุณากรอกนามสกุล"
            className="flex-1"
            inputClassName={styles.input}
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </div>

        <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>ช่องทางการติดต่อ</p>
        <div className="flex flex-col sm:flex-row gap-6">
          <FormInput
            label="เบอร์โทร"
            placeholder="กรุณากรอกเบอร์โทร"
            className="flex-1"
            inputClassName={styles.input}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <FormInput
            label="อีเมล"
            placeholder="กรุณากรอกอีเมล"
            className="flex-1"
            inputClassName={styles.input}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>ตั้งค่าเข้าสู่ระบบ</p>
        <div className="flex flex-col sm:flex-row gap-6">
          <FormInputIcon
            label="รหัสผ่าน"
            placeholder="กรุณากรอกรหัสผ่าน"
            className="flex-1"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type={showPassword ? "text" : "password"}
            icon={<Lock size={16} className="text-gray-400" />}
            suffix={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
              </button>
            }
          />
          <FormInputIcon
            label="ยืนยันรหัสผ่าน"
            placeholder="กรุณากรอกรหัสผ่านอีกครั้ง"
            className="flex-1"
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            type={showConfirmPassword ? "text" : "password"}
            icon={<Lock size={16} className="text-gray-400" />}
            suffix={
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
              </button>
            }
          />
        </div>

        {userType === "company" && (
          <>
            <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>หน่วยงาน</p>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-1 flex-1">
                <p style={{ fontSize: 16, fontWeight: 500 }}>เลือกหน่วยงาน</p>
                <select
                  className={styles.input}
                  value={form.organization_id}
                  onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                  disabled={orgsLoading}
                >
                  <option value="">กรุณาเลือกหน่วยงาน</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1" />
            </div>
          </>
        )}

        <div>
          <p style={{ fontSize: 16, fontWeight: 1000, color: "#366DBD" }}>ยืนยันตัวตน</p>
          <OtpInput email={form.email} onOtpChange={setOtp} />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

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
    </div>
  );
}
