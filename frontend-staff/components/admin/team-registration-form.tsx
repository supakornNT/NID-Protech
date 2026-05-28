"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  formatCitizenIdInput,
  formatOtpCountdown,
  formatPhoneInput,
  OTP_LENGTH,
  useTeamRegistrationForm,
} from "@/hooks/team/use-team-registration-form";

export function TeamRegistrationForm() {
  const {
    addPendingTeam,
    availableTeamOptions,
    canSendOtp,
    closeOtpModal,
    feedbackMessage,
    formState,
    handleOtpKeyDown,
    handleOtpPaste,
    handleSendOtp,
    hasRequestedOtp,
    loading,
    normalizedEmail,
    openOtpModal,
    otpCountdown,
    otpInputRefs,
    otpModalOpen,
    pendingTeamId,
    prefixOptions,
    saving,
    setSuccessModalOpen,
    sendingOtp,
    selectedTeams,
    setPendingTeamId,
    setShowConfirmPassword,
    showConfirmPassword,
    successModalOpen,
    submitRegistration,
    toggleTeam,
    updateField,
    updateOtpDigit,
    validationMessage,
  } = useTeamRegistrationForm();

  const otpDigits = useMemo(
    () =>
      Array.from(
        { length: OTP_LENGTH },
        (_, index) => formState.otp[index] ?? "",
      ),
    [formState.otp],
  );

  return (
    <>
      <div className="rounded-[24px] bg-[#E8EFFB] px-6 py-6">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-6">
              <FormSection title="ข้อมูลลงทะเบียนเจ้าหน้าที่">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr_1fr]">
                  <SelectField
                    label="คำนำหน้า"
                    value={formState.prefixId}
                    onChange={(value) => updateField("prefixId", value)}
                    options={prefixOptions.map((option) => ({
                      value: String(option.value),
                      label: option.label,
                    }))}
                    placeholder={loading ? "กำลังโหลดคำนำหน้า..." : "คำนำหน้า"}
                  />
                  <InputField
                    label="ชื่อ"
                    value={formState.name}
                    placeholder="กรอกชื่อ"
                    icon={<UserRound size={20} />}
                    onChange={(value) => updateField("name", value)}
                  />
                  <InputField
                    label="นามสกุล"
                    value={formState.surname}
                    placeholder="กรอกนามสกุล"
                    onChange={(value) => updateField("surname", value)}
                  />
                </div>

                <div className="mt-4">
                  <InputField
                    label="เลขบัตรประชาชน"
                    value={formState.citizenId}
                    inputMode="numeric"
                    maxLength={17}
                    placeholder="1-2345-67890-12-3"
                    icon={<IdCard size={20} />}
                    onChange={(value) =>
                      updateField("citizenId", formatCitizenIdInput(value))
                    }
                  />
                </div>
              </FormSection>

              <FormSection title="กลุ่มและสิทธิ์การทำงาน">
                <div className="space-y-3">
                  <label className="block text-[15px] font-medium text-[#111827]">
                    ทีม
                  </label>
                  <div className="flex items-center overflow-hidden rounded-2xl border border-[#A8B1C2] bg-white">
                    <div className="min-w-0 flex-1">
                      <SelectField
                        compact
                        value={pendingTeamId}
                        onChange={setPendingTeamId}
                        options={availableTeamOptions}
                        placeholder={
                          loading
                            ? "กำลังโหลดรายการทีม..."
                            : availableTeamOptions.length > 0
                              ? "เลือกทีมที่ต้องการเพิ่ม"
                              : "เพิ่มทีมครบแล้ว"
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="flex h-12 shrink-0 items-center gap-2 border-l border-[#D7E0EF] bg-[#F4F8FF] px-4 text-[14px] font-medium text-[#2F66C5] transition hover:bg-[#E8F1FF] disabled:cursor-not-allowed disabled:text-[#A8B1C2]"
                      title="เพิ่มทีม"
                      onClick={addPendingTeam}
                      disabled={loading || availableTeamOptions.length === 0}
                    >
                      <Plus size={18} />
                      เพิ่มทีม
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#C8D4EA] bg-white/80 px-4 py-3">
                    <p className="text-sm font-medium text-[#111827]">
                      ทีมที่เลือก
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {selectedTeams.length > 0 ? (
                        selectedTeams.map((team) => (
                          <div
                            key={team.value}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-[#D9E4F5] bg-[#F7FAFF] px-3.5 py-2.5"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#2F66C5]">
                                {team.label}
                              </p>
                              <p className="mt-1 text-xs text-[#8B95A7]">
                                {team.status === "active"
                                  ? "สถานะ: ใช้งาน"
                                  : "สถานะ: ไม่ใช้งาน"}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="rounded-full border border-[#D9E4F5] px-3 py-1 text-xs font-medium text-[#D1435B] transition hover:bg-[#FFF5F7]"
                              onClick={() => toggleTeam(String(team.value))}
                            >
                              ลบ
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-[#8B95A7]">
                          ยังไม่ได้เลือกทีม
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title="ช่องทางการติดต่อ">
                <div className="space-y-4">
                  <InputField
                    label="เบอร์โทร"
                    value={formState.phone}
                    inputMode="tel"
                    maxLength={12}
                    placeholder="081-234-5678"
                    icon={<Phone size={20} />}
                    onChange={(value) =>
                      updateField("phone", formatPhoneInput(value))
                    }
                  />
                  <InputField
                    label="อีเมล"
                    value={formState.email}
                    placeholder="กรอกอีเมล"
                    icon={<Mail size={20} />}
                    onChange={(value) => updateField("email", value)}
                  />
                </div>
              </FormSection>
            </div>

            <div className="space-y-6">
              <FormSection title="ตั้งค่าเข้าสู่ระบบ">
                <div className="space-y-4">
                  <InputField
                    label="รหัสผ่าน"
                    value={formState.password}
                    type="password"
                    placeholder="กรอกรหัสผ่าน"
                    icon={<Lock size={20} />}
                    onChange={(value) => updateField("password", value)}
                  />
                  <InputField
                    label="ยืนยันรหัสผ่าน"
                    value={formState.confirmPassword}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="กรอกยืนยันรหัสผ่าน"
                    icon={<Lock size={20} />}
                    trailingAction={
                      <button
                        type="button"
                        className="text-[#6B7280] transition hover:text-[#2F66C5]"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                    onChange={(value) => updateField("confirmPassword", value)}
                  />
                  <p className="text-sm text-[#6B7280]">
                    รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักษรพิเศษ อย่างน้อย 8 ตัว
                  </p>
                </div>
              </FormSection>

            </div>
          </div>

          {validationMessage && !otpModalOpen ? (
            <p className="mt-5 rounded-2xl border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
              {validationMessage}
            </p>
          ) : null}

          <div className="mt-9 flex justify-center">
            <ProTechButton
              variant="primary"
              className="h-[62px] w-full max-w-[548px] rounded-[14px] px-6 text-[17px]"
              disabled={loading || saving}
              onClick={openOtpModal}
            >
              {saving ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียน"}
            </ProTechButton>
          </div>
        </div>
      </div>

      <AdminModalShell
        open={otpModalOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeOtpModal();
            return;
          }

          openOtpModal();
        }}
        title="ยืนยันตัวตน"
        widthClassName="max-w-[520px]"
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#111827]">อีเมล</label>
            <input
              type="text"
              readOnly
              value={normalizedEmail}
              className="h-10 w-full rounded-md border border-[#A8B1C2] bg-[#F8FAFC] px-3 text-[#475569] outline-none"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#111827]">OTP</label>
            <div className="flex flex-wrap items-center gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpInputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  className="h-10 w-10 rounded-xl border border-[#A8B1C2] bg-white text-center text-lg outline-none"
                  onChange={(event) =>
                    updateOtpDigit(index, event.target.value)
                  }
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <ProTechButton
                variant="outline"
                className="h-9 px-4"
                onClick={() => {
                  void handleSendOtp();
                }}
                disabled={!canSendOtp}
              >
                {sendingOtp
                  ? "กำลังส่ง OTP..."
                  : hasRequestedOtp
                    ? "ส่ง OTP อีกครั้ง"
                    : "ส่ง OTP"}
              </ProTechButton>

              {hasRequestedOtp ? (
                <p className="text-sm text-[#6B7280]">
                  เหลือเวลา {formatOtpCountdown(otpCountdown)}
                </p>
              ) : null}
            </div>
          </div>

          {feedbackMessage ? (
            <p className="rounded-md border border-[#C7DCF8] bg-[#EEF5FF] px-4 py-3 text-sm text-[#174F9F]">
              {feedbackMessage}
            </p>
          ) : null}

          {validationMessage && otpModalOpen ? (
            <p className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
              {validationMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-[120px]"
              disabled={saving}
              onClick={() => {
                void submitRegistration();
              }}
            >
              {saving ? "กำลังยืนยัน..." : "ยืนยัน"}
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      <AdminModalShell
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="ลงทะเบียนเจ้าหน้าที่สำเร็จ"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
              <CheckCircle2 size={34} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            ระบบได้บันทึกข้อมูลเจ้าหน้าที่เรียบร้อยแล้ว
          </p>

          <div className="flex justify-center pt-1">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-[120px]"
              onClick={() => setSuccessModalOpen(false)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </>
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
      <h2 className="mb-2.5 text-[15px] font-semibold text-[#3A6FCF] underline underline-offset-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InputField({
  label,
  value,
  placeholder,
  icon,
  trailingAction,
  type = "text",
  inputMode,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon?: React.ReactNode;
  trailingAction?: React.ReactNode;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[15px] font-medium text-[#111827]">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-2xl border border-[#A8B1C2] bg-white px-3.5">
        {icon ? <span className="mr-3 text-[#6B7280]">{icon}</span> : null}
        <input
          type={type}
          value={value}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          onChange={(event) => onChange(event.target.value)}
        />
        {trailingAction ? (
          <span className="ml-3 flex shrink-0 items-center">
            {trailingAction}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  compact = false,
  onChange,
}: {
  label?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  compact?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <label className="block text-[15px] font-medium text-[#111827]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          value={value}
          className={`w-full appearance-none bg-white px-3.5 pr-11 text-[15px] text-[#111827] outline-none ${
            compact
              ? "h-12 rounded-none border-0"
              : "h-12 rounded-2xl border border-[#A8B1C2]"
          }`}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#6B7280]" />
      </div>
    </div>
  );
}
