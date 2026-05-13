"use client";
import { useState, useEffect, useRef } from "react";
import { fetchJson } from "@/lib/fetch";

interface OtpInputProps {
  email?: string;
  onOtpChange?: (otp: string) => void;
}

export function OtpInput({ email, onOtpChange }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email) return;
    try {
      await fetchJson("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCountdown(60);
    } catch {
      alert("ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onOtpChange?.(newOtp.join(""));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const isSending = countdown !== null && countdown > 0;

  return (
    <div className="flex flex-col gap-2">
      <p style={{ fontSize: 16, fontWeight: 500 }}>OTP</p>
      <div className="flex flex-wrap items-center gap-2">
        {otp.map((val, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-8 h-8 sm:w-10 sm:h-10 text-center text-base sm:text-lg border border-gray-300 rounded-lg bg-white outline-none"
          />
        ))}

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isSending || !email}
          style={{
            background: isSending || !email ? "#93c5fd" : "#366DBD",
            borderRadius: 8,
            color: "#fff",
            fontSize: 16,
            padding: "8px 16px",
            marginLeft: 8,
            cursor: isSending ? "not-allowed" : "pointer",
          }}
        >
          ส่ง OTP
        </button>
      </div>

      {/* countdown */}
      {isSending && (
        <p style={{ fontSize: 14, color: "#929396" }}>
          เหลือเวลา {formatTime(countdown!)}
        </p>
      )}
    </div>
  );
}
