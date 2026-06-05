"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import { LogOut, Menu } from "lucide-react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import StaffSidebar, {
  type StaffSidebarModule,
} from "@/components/sidebar/staff-sidebar";
import {
  StaffSessionProvider,
  useStaffSession,
} from "@/contexts/staff-session-context";

function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sessionLoaderStartedRef = useRef(false);
  const { staff, loading, logout, sessionExpiredOpen } = useStaffSession();
  const topLoader = useTopLoader();

  const staffName = staff?.name?.trim() || "Screener User";
  const avatarInitial = staffName.charAt(0).toUpperCase() || "A";
  const staffModules = Array.isArray(staff?.modules)
    ? (staff.modules as StaffSidebarModule[])
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const sessionExpiredModal = (
    <AdminModalShell
      open={sessionExpiredOpen}
      onOpenChange={() => {}}
      title="หมดเวลาการใช้งาน"
      widthClassName="max-w-[400px]"
    >
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
          className="
            h-11 w-full rounded-xl bg-[#2F66C5]
            text-sm font-semibold text-white
            transition duration-200 hover:bg-[#3564A8] active:scale-[0.98]
          "
        >
          กลับสู่หน้า Login
        </button>
      </div>
    </AdminModalShell>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {sessionExpiredModal}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB]">
      <div className="flex min-h-screen w-full bg-white">
        <StaffSidebar
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          modules={staffModules}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <header
            className="
              flex h-21 items-center justify-between
              border-b border-[#E5E7EB]
              bg-[#E9EEF5]
              px-4
              sm:px-8
              lg:px-10
            "
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="
                  flex h-10 w-10 items-center justify-center rounded-lg
                  bg-[#3D71BC] text-white shadow-sm
                  transition-all duration-200 ease-in-out
                  hover:scale-105 hover:bg-[#3564A8] hover:shadow-md hover:opacity-95
                  active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-[#3D71BC] focus:ring-offset-2
                  lg:hidden
                "
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-xs text-gray-400">ระบบจัดการ</p>
                <h1 className="mt-1 text-sm font-semibold text-[#2F66C5]">
                  ProTech Support
                </h1>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="
                  flex items-center gap-3 rounded-full p-1.5
                  text-left transition-all duration-200
                  hover:bg-[#d0daf0]/50 active:scale-98
                  focus:outline-none cursor-pointer
                "
              >
                <div className="hidden max-w-[180px] text-right sm:block">
                  <p className="truncate text-sm font-semibold text-gray-700">
                    {staffName}
                  </p>
                  <p className="text-xs text-gray-400">เจ้าหน้าที่</p>
                </div>

                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-full border border-gray-200/50 bg-white
                    text-sm font-bold text-[#2F66C5] shadow-sm
                  "
                >
                  {avatarInitial}
                </div>
              </button>

              {dropdownOpen ? (
                <div
                  className="
                    absolute right-0 z-50 mt-2 w-[260px] sm:w-48
                    rounded-2xl border border-gray-200/60 bg-white p-2
                    shadow-xl shadow-gray-200/80
                    animate-in fade-in slide-in-from-top-2 duration-150
                  "
                >
                  <div className="border-b border-gray-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {staffName}
                    </p>
                    {staff?.email ? (
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {staff.email}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="
                      flex w-full items-center gap-3 rounded-xl px-4 py-2.5
                      text-left text-sm font-semibold text-gray-600
                      transition-colors duration-150
                      hover:bg-red-50 hover:text-red-600 cursor-pointer
                    "
                  >
                    <LogOut size={16} />
                    ออกจากระบบ
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <main
            className="
              min-w-0 flex flex-1 flex-col
              bg-white
            "
          >
            {children}
          </main>
        </div>
      </div>

      <AdminModalShell
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        title="ยืนยันการออกจากระบบ"
        widthClassName="max-w-[400px]"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500">
            คุณต้องการออกจากระบบ ProTech Support ใช่หรือไม่?
          </p>
          <div className="mt-4 flex w-full gap-3">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(false)}
              className="
                h-11 flex-1 rounded-xl border border-gray-200 bg-white
                text-sm font-semibold text-gray-700
                transition duration-200 hover:bg-gray-50 active:scale-[0.98]
              "
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                void logout();
              }}
              className="
                h-11 flex-1 rounded-xl bg-[#2F66C5]
                text-sm font-semibold text-white
                transition duration-200 hover:bg-[#3564A8] active:scale-[0.98]
              "
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </AdminModalShell>

      {sessionExpiredModal}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffSessionProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </StaffSessionProvider>
  );
}
