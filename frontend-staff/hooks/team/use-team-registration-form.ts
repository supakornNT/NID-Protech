"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const OTP_LENGTH = 5;
const OTP_TIMEOUT_SECONDS = 60;

export type PrefixOption = {
  value: number;
  label: string;
};

export type TeamOption = {
  value: number;
  label: string;
  status: "active" | "inactive";
};

export type TeamRegistrationFormState = {
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

export type TeamSelectOption = {
  value: string;
  label: string;
};

type StaffOptionsResponse = {
  prefixes: PrefixOption[];
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

export function formatPhoneInput(value: string) {
  const digits = keepDigitsOnly(value).slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatCitizenIdInput(value: string) {
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

export function formatOtpCountdown(seconds: number) {
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

export function useTeamRegistrationForm() {
  const [formState, setFormState] =
    useState<TeamRegistrationFormState>(EMPTY_FORM_STATE);
  const [pendingTeamId, setPendingTeamId] = useState("");
  const [prefixOptions, setPrefixOptions] = useState<PrefixOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
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
      const nextCountdown = Math.max(otpCountdown - 1, 0);
      setOtpCountdown(nextCountdown);

      if (hasRequestedOtp && nextCountdown === 0) {
        setValidationMessage("OTP เก่าหมดอายุแล้ว กรุณาส่ง OTP อีกครั้ง");
      }
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasRequestedOtp, otpCountdown]);

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
  const canSendOtp =
    isValidEmail(normalizedEmail) &&
    !saving &&
    !sendingOtp &&
    otpCountdown === 0;

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
    const currentOtp = formState.otp
      .padEnd(OTP_LENGTH, " ")
      .slice(0, OTP_LENGTH)
      .split("");
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

    const passwordValidation = validatePassword(
      formState.password,
      formState.confirmPassword,
    );

    if (passwordValidation) {
      return passwordValidation;
    }

    if (!hasRequestedOtp) {
      return "กรุณาส่ง OTP ก่อนยืนยันการลงทะเบียน";
    }

    if (otpCountdown === 0) {
      return "OTP เก่าหมดอายุแล้ว กรุณาส่ง OTP อีกครั้ง";
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

  function validateBeforeOtp() {
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

    const passwordValidation = validatePassword(
      formState.password,
      formState.confirmPassword,
    );

    if (passwordValidation) {
      return passwordValidation;
    }

    const citizenDigits = keepDigitsOnly(formState.citizenId);

    if (citizenDigits.length > 0 && citizenDigits.length !== 13) {
      return "กรุณากรอกเลขบัตรประชาชน 13 หลัก";
    }

    return null;
  }

  function openOtpModal() {
    const nextValidationMessage = validateBeforeOtp();
    setValidationMessage(nextValidationMessage);

    if (nextValidationMessage) {
      setFeedbackMessage(null);
      return;
    }

    setOtpModalOpen(true);
  }

  function closeOtpModal() {
    updateField("otp", "");
    setHasRequestedOtp(false);
    setOtpCountdown(0);
    setFeedbackMessage(null);
    setValidationMessage(null);
    setOtpModalOpen(false);
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
      setSendingOtp(true);
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
      setHasRequestedOtp(true);
      updateField("otp", "");
      setOtpCountdown(OTP_TIMEOUT_SECONDS);
    } catch (submitError) {
      setValidationMessage(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถส่ง OTP ได้",
      );
    } finally {
      setSendingOtp(false);
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
      setFeedbackMessage(null);
      setHasRequestedOtp(false);
      setOtpModalOpen(false);
      setOtpCountdown(0);
      setSuccessModalOpen(true);
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

  return {
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
    otpModalOpen,
    otpCountdown,
    otpInputRefs,
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
    teamOptions,
    toggleTeam,
    updateField,
    updateOtpDigit,
    validationMessage,
    addPendingTeam,
  };
}
