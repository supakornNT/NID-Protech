"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import Navbar from "@/components/navbar";
import {
  UserSessionProvider,
  useUserSession,
} from "@/contexts/user-session-context";

function UserLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading, sessionExpiredOpen } = useUserSession();
  const topLoader = useTopLoader();
  const sessionLoaderStartedRef = useRef(false);

  const sessionExpiredModal = sessionExpiredOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Session หมดอายุแล้ว
            </p>
            <p className="mt-1 text-sm text-gray-500">
              คุณไม่ได้ใช้งานระบบเป็นเวลานาน
              <br />
              กรุณาเข้าสู่ระบบใหม่อีกครั้ง
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="h-11 w-full rounded-xl bg-[#2F66C5] text-sm font-semibold text-white transition duration-200 hover:bg-[#3564A8] active:scale-[0.98]"
          >
            กลับสู่หน้า Login
          </button>
        </div>
      </div>
    </div>
  ) : null;

  useEffect(() => {
    if (loading) {
      const timer = window.setTimeout(() => {
        sessionLoaderStartedRef.current = true;
        topLoader.start();
      }, 180);

      return () => {
        window.clearTimeout(timer);

        if (sessionLoaderStartedRef.current) {
          topLoader.done(true);
          sessionLoaderStartedRef.current = false;
        }
      };
    }

    if (sessionLoaderStartedRef.current) {
      topLoader.done(true);
      sessionLoaderStartedRef.current = false;
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-white">
        {sessionExpiredModal}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-white">
      {sessionExpiredModal}
      <Navbar />
      <main className="w-full flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserSessionProvider>
      <UserLayoutShell>{children}</UserLayoutShell>
    </UserSessionProvider>
  );
}
