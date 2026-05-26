"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import type { UserListApiItem } from "@/hooks/users/use-users-management";

type UserPasswordModalProps = {
  open: boolean;
  saving: boolean;
  user: UserListApiItem | null;
  onOpenChange: (open: boolean) => void;
  onSendOtp: () => Promise<{ success: boolean; message: string }>;
  onSubmit: (
    password: string,
    otp: string,
  ) => Promise<{ success: boolean; message: string }>;
};

const OTP_LENGTH = 5;
const OTP_TIMEOUT_SECONDS = 300;

function formatRemainingTime(value: number) {
  const minutes = String(Math.floor(value / 60)).padStart(2, "0");
  const seconds = String(value % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function UserPasswordModal({
  open,
  saving,
  user,
  onOpenChange,
  onSendOtp,
  onSubmit,
}: UserPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setCountdown(0);
    setMessage(null);
    setError(null);
  }, [open, user]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [countdown]);

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);

  return (
    <AdminModalShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setMessage(null);
          setError(null);
        }
        onOpenChange(nextOpen);
      }}
      title="เปลี่ยนรหัสผ่าน"
      widthClassName="max-w-[520px]"
    >
      <div className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#111827]">ชื่อ</label>
          <input
            type="text"
            readOnly
            value={user?.fullName ?? ""}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-[#F8FAFC] px-3 text-[#475569] outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#111827]">อีเมล</label>
          <input
            type="text"
            readOnly
            value={user?.email ?? ""}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-[#F8FAFC] px-3 text-[#475569] outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#111827]">รหัสผ่านใหม่</label>
          <input
            type="password"
            value={password}
            maxLength={255}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#111827]">ยืนยันรหัสผ่าน</label>
          <input
            type="password"
            value={confirmPassword}
            maxLength={255}
            className="h-10 w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[#111827]">OTP</label>
          <div className="flex flex-wrap items-center gap-2">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                className="h-10 w-10 rounded-xl border border-[#A8B1C2] bg-white text-center text-lg outline-none"
                onChange={(event) => {
                  const nextValue = event.target.value.replace(/\D/g, "");

                  if (nextValue.length > 1) {
                    return;
                  }

                  setOtpDigits((current) => {
                    const nextDigits = [...current];
                    nextDigits[index] = nextValue;
                    return nextDigits;
                  });

                  if (nextValue && index < OTP_LENGTH - 1) {
                    inputRefs.current[index + 1]?.focus();
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Backspace" &&
                    !otpDigits[index] &&
                    index > 0
                  ) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <ProTechButton
              variant="outline"
              className="h-9 px-4"
              disabled={saving || countdown > 0}
              onClick={() => {
                void (async () => {
                  const result = await onSendOtp();

                  if (result.success) {
                    setCountdown(OTP_TIMEOUT_SECONDS);
                    setMessage(result.message);
                    setError(null);
                  } else {
                    setError(result.message);
                    setMessage(null);
                  }
                })();
              }}
            >
              ส่ง OTP
            </ProTechButton>

            {countdown > 0 ? (
              <p className="text-sm text-[#6B7280]">
                เหลือเวลา {formatRemainingTime(countdown)}
              </p>
            ) : null}
          </div>
        </div>

        {message ? (
          <p className="rounded-md border border-[#C7DCF8] bg-[#EEF5FF] px-4 py-3 text-sm text-[#174F9F]">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <ProTechButton
            variant="delete"
            className="h-10 min-w-[88px]"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            ยกเลิก
          </ProTechButton>
          <ProTechButton
            variant="primary"
            className="h-10 min-w-[88px]"
            disabled={saving}
            onClick={() => {
              if (!password) {
                setError("กรุณากรอกรหัสผ่านใหม่");
                return;
              }

              if (password.length < 8) {
                setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
                return;
              }

              if (password !== confirmPassword) {
                setError("ยืนยันรหัสผ่านไม่ตรงกัน");
                return;
              }

              if (otpValue.length !== OTP_LENGTH) {
                setError("กรุณากรอก OTP ให้ครบ");
                return;
              }

              void (async () => {
                const result = await onSubmit(password, otpValue);

                if (!result.success) {
                  setError(result.message);
                  return;
                }

                setError(null);
                setMessage(result.message);
                onOpenChange(false);
              })();
            }}
          >
            {saving ? "กำลังยืนยัน..." : "ยืนยัน"}
          </ProTechButton>
        </div>
      </div>
    </AdminModalShell>
  );
}
