"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
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

import { ProTechButton } from "@/components/tables/protech-button";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const OTP_LENGTH = 5;
const OTP_TIMEOUT_SECONDS = 300;

type PrefixOption = {
  value: number;
  label: string;
};

type TeamOption = {
  value: number;
  label: string;
  status: "active" | "inactive";
};

type TeamRegistrationFormState = {
  prefixId: string;
  name: string;
  surname: string;
  citizenId: string;
  phone: string;
  email: string;
  teamIds: string[];
  password: string;
  confirmPassword: string;
  otp: string;
};

type TeamSelectOption = {
  value: string;
  label: string;
};

type StaffOptionsResponse = {
  prefixes: PrefixOption[];
  roles: Array<{ value: number; label: string }>;
};

const EMPTY_FORM_STATE: TeamRegistrationFormState = {
  prefixId: "",
  name: "",
  surname: "",
  citizenId: "",
  phone: "",
  email: "",
  teamIds: [],
  password: "",
  confirmPassword: "",
  otp: "",
};

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

function formatOtpCountdown(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getResponseErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  const result = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;

  if (Array.isArray(result?.message)) {
    return result.message[0] || fallbackMessage;
  }

  if (typeof result?.message === "string" && result.message.trim()) {
    return result.message;
  }

  return fallbackMessage;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function TeamRegistrationForm() {
  const [formState, setFormState] =
    useState<TeamRegistrationFormState>(EMPTY_FORM_STATE);
  const [pendingTeamId, setPendingTeamId] = useState("");
  const [prefixOptions, setPrefixOptions] = useState<PrefixOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        setLoading(true);

        const [staffOptionsResponse, teamOptionsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/staffs/users/options`, {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${API_BASE_URL}/admin/teams/options`, {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!staffOptionsResponse.ok) {
          throw new Error(
            await getResponseErrorMessage(
              staffOptionsResponse,
              "ไม่สามารถโหลดตัวเลือกคำนำหน้าได้",
            ),
          );
        }

        if (!teamOptionsResponse.ok) {
          throw new Error(
            await getResponseErrorMessage(
              teamOptionsResponse,
              "ไม่สามารถโหลดรายการทีมได้",
            ),
          );
        }

        const staffOptionsResult =
          (await staffOptionsResponse.json()) as StaffOptionsResponse;
        const teamOptionsResult =
          (await teamOptionsResponse.json()) as TeamOption[];

        setPrefixOptions(staffOptionsResult.prefixes);
        setTeamOptions(teamOptionsResult);
      } catch (loadError) {
        if (isAbortError(loadError)) {
          return;
        }

        setValidationMessage(
          loadError instanceof Error
            ? loadError.message
            : "ไม่สามารถโหลดข้อมูลเริ่มต้นได้",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (otpCountdown <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOtpCountdown((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [otpCountdown]);

  const selectedTeams = useMemo(
    () =>
      teamOptions.filter((team) =>
        formState.teamIds.includes(String(team.value)),
      ),
    [formState.teamIds, teamOptions],
  );

  const availableTeamOptions = useMemo<TeamSelectOption[]>(
    () =>
      teamOptions
        .filter((team) => !formState.teamIds.includes(String(team.value)))
        .map((team) => ({
          value: String(team.value),
          label: team.label,
        })),
    [formState.teamIds, teamOptions],
  );

  const normalizedEmail = formState.email.trim().toLowerCase();
  const canSendOtp = isValidEmail(normalizedEmail) && !saving;

  function updateField<Key extends keyof TeamRegistrationFormState>(
    key: Key,
    value: TeamRegistrationFormState[Key],
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleTeam(teamId: string) {
    setFormState((current) => {
      const exists = current.teamIds.includes(teamId);

      return {
        ...current,
        teamIds: exists
          ? current.teamIds.filter((value) => value !== teamId)
          : [...current.teamIds, teamId],
      };
    });
  }

  function addPendingTeam() {
    if (!pendingTeamId) {
      setValidationMessage("กรุณาเลือกทีมที่ต้องการเพิ่ม");
      return;
    }

    toggleTeam(pendingTeamId);
    setPendingTeamId("");
    setValidationMessage(null);
  }

  function updateOtpDigit(index: number, value: string) {
    const normalized = keepDigitsOnly(value).slice(-1);
    const currentOtp = formState.otp.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");
    currentOtp[index] = normalized || "";

    const nextOtp = currentOtp.join("").replace(/\s/g, "");
    updateField("otp", nextOtp);

    if (normalized && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !formState.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pastedValue = keepDigitsOnly(event.clipboardData.getData("text")).slice(
      0,
      OTP_LENGTH,
    );

    updateField("otp", pastedValue);

    const focusIndex = Math.min(
      Math.max(pastedValue.length - 1, 0),
      OTP_LENGTH - 1,
    );
    otpInputRefs.current[focusIndex]?.focus();
  }

  function validateForm() {
    if (!formState.name.trim()) {
      return "กรุณากรอกชื่อ";
    }

    if (!formState.surname.trim()) {
      return "กรุณากรอกนามสกุล";
    }

    if (!normalizedEmail) {
      return "กรุณากรอกอีเมล";
    }

    if (!isValidEmail(normalizedEmail)) {
      return "กรุณากรอกอีเมลให้ถูกต้อง";
    }

    if (formState.teamIds.length === 0) {
      return "กรุณาเลือกทีมอย่างน้อย 1 ทีม";
    }

    if (!formState.password) {
      return "กรุณากรอกรหัสผ่าน";
    }

    if (formState.password.length < 8) {
      return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }

    if (formState.password !== formState.confirmPassword) {
      return "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน";
    }

    if (formState.otp.length !== OTP_LENGTH) {
      return `กรุณากรอก OTP ให้ครบ ${OTP_LENGTH} หลัก`;
    }

    const citizenDigits = keepDigitsOnly(formState.citizenId);

    if (citizenDigits.length > 0 && citizenDigits.length !== 13) {
      return "กรุณากรอกเลขบัตรประชาชน 13 หลัก";
    }

    return null;
  }

  async function handleSendOtp() {
    if (!normalizedEmail) {
      setValidationMessage("กรุณากรอกอีเมลก่อนส่ง OTP");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setValidationMessage("กรุณากรอกอีเมลให้ถูกต้องก่อนส่ง OTP");
      return;
    }

    try {
      setValidationMessage(null);
      setFeedbackMessage(null);

      const response = await fetch(
        `${API_BASE_URL}/admin/staffs/send-registration-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(response, "ไม่สามารถส่ง OTP ได้"),
        );
      }

      setFeedbackMessage("ส่ง OTP แล้ว");
      setOtpCountdown(OTP_TIMEOUT_SECONDS);
    } catch (submitError) {
      setValidationMessage(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถส่ง OTP ได้",
      );
    }
  }

  async function submitRegistration() {
    const nextValidationMessage = validateForm();
    setValidationMessage(nextValidationMessage);

    if (nextValidationMessage) {
      setFeedbackMessage(null);
      return;
    }

    try {
      setSaving(true);
      setFeedbackMessage(null);

      const response = await fetch(`${API_BASE_URL}/admin/staffs/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefixId: formState.prefixId ? Number(formState.prefixId) : null,
          name: formState.name.trim(),
          surname: formState.surname.trim(),
          email: normalizedEmail,
          phone: keepDigitsOnly(formState.phone) || null,
          citizenId: keepDigitsOnly(formState.citizenId) || null,
          password: formState.password,
          otp: formState.otp,
          teamIds: formState.teamIds.map((teamId) => Number(teamId)),
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "ไม่สามารถบันทึกข้อมูลลงทะเบียนได้",
          ),
        );
      }

      setFormState(EMPTY_FORM_STATE);
      setPendingTeamId("");
      setValidationMessage(null);
      setFeedbackMessage("บันทึกข้อมูลลงทะเบียนเจ้าหน้าที่เรียบร้อยแล้ว");
      setOtpCountdown(0);
    } catch (submitError) {
      setValidationMessage(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถบันทึกข้อมูลลงทะเบียนได้",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-6 sm:px-6 sm:py-7 lg:px-7 lg:py-8">
      <div className="mx-auto max-w-[920px] space-y-4">
        <div>
          <h1 className="text-[28px] font-bold leading-none text-[#111827]">
            จัดการข้อมูลลงทะเบียนทีมแก้ไขประเด็น
          </h1>
          <p className="mt-2 text-[14px] text-[#8B95A7]">
            ลงทะเบียนเจ้าหน้าที่และเลือกผูกทีมจากข้อมูลจริงในระบบ
          </p>
        </div>

        <div className="rounded-[24px] bg-[#E8EFFB] px-6 py-6">
          <div className="space-y-8">
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
                    placeholder={
                      loading ? "กำลังโหลดคำนำหน้า..." : "คำนำหน้า"
                    }
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
                    onChange={(value) =>
                      updateField("confirmPassword", value)
                    }
                  />
                </div>
              </FormSection>

              <FormSection title="ยืนยันตัวตน">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="block text-[15px] font-medium text-[#111827]">
                      OTP
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                        <input
                          key={index}
                          ref={(element) => {
                            otpInputRefs.current[index] = element;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={formState.otp[index] ?? ""}
                          className="h-12 w-12 rounded-2xl border border-[#A8B1C2] bg-white text-center text-[18px] font-semibold text-[#111827] outline-none transition focus:border-[#2F66C5]"
                          onChange={(event) =>
                            updateOtpDigit(index, event.target.value)
                          }
                          onKeyDown={(event) => handleOtpKeyDown(index, event)}
                          onPaste={handleOtpPaste}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="rounded-xl bg-[#9CC0FF] px-5 py-2 text-[14px] text-white transition hover:bg-[#86B1FB] disabled:cursor-not-allowed disabled:bg-[#C8D8F8]"
                      onClick={() => {
                        void handleSendOtp();
                      }}
                      disabled={!canSendOtp}
                    >
                      ส่ง OTP
                    </button>
                  </div>
                  <p className="pl-1 text-[14px] text-[#8B95A7]">
                    เหลือเวลา {formatOtpCountdown(otpCountdown)}
                  </p>
                </div>
              </FormSection>
            </div>
          </div>

          {validationMessage ? (
            <p className="mt-5 rounded-2xl border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
              {validationMessage}
            </p>
          ) : null}

          {!validationMessage && feedbackMessage ? (
            <p className="mt-5 rounded-2xl border border-[#B9D7FF] bg-[#F4F8FF] px-4 py-3 text-sm text-[#2F66C5]">
              {feedbackMessage}
            </p>
          ) : null}

          <div className="mt-9 flex justify-center">
            <ProTechButton
              variant="primary"
              className="h-[62px] w-full max-w-[548px] rounded-[14px] px-6 text-[17px]"
              disabled={loading || saving}
              onClick={() => {
                void submitRegistration();
              }}
            >
              {saving ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียน"}
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
