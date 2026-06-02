"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Menu, LogOut } from "lucide-react";

import StaffSidebar, {
  type StaffSidebarModule,
} from "@/components/sidebar/staff-sidebar";
import { fetchJson } from "@/lib/fetch";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";

type StaffSession = {
  id: number;
  email: string;
  name: string;
  modules?: StaffSidebarModule[];
  sessionExpiresAt?: string | null;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sessionExpiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staffName, setStaffName] = useState<string>("Screener User");
  const [avatarInitial, setAvatarInitial] = useState<string>("A");
  const [loading, setLoading] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [staffModules, setStaffModules] = useState<StaffSidebarModule[]>([]);

  function clearSessionExpiryTimer() {
    if (sessionExpiryTimerRef.current) {
      clearTimeout(sessionExpiryTimerRef.current);
      sessionExpiryTimerRef.current = null;
    }
  }

  function showSessionExpired() {
    clearSessionExpiryTimer();
    localStorage.removeItem("protech_staff");
    setSessionExpiredOpen(true);
  }

  function scheduleSessionExpiry(expiresAt?: string | null) {
    clearSessionExpiryTimer();

    if (!expiresAt) {
      return;
    }

    const delay = new Date(expiresAt).getTime() - Date.now();

    if (delay <= 0) {
      showSessionExpired();
      return;
    }

    sessionExpiryTimerRef.current = setTimeout(showSessionExpired, delay);
  }

  async function handleLogout() {
    try {
      await fetchJson("/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    }
    clearSessionExpiryTimer();
    localStorage.removeItem("protech_staff");
    router.replace("/login");
  }


  useEffect(() => {
    function onSessionExpired() {
      showSessionExpired();
    }
    window.addEventListener("session:expired", onSessionExpired);
    return () => window.removeEventListener("session:expired", onSessionExpired);
  }, []);

  useEffect(() => {
    return clearSessionExpiryTimer;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const staff = await fetchJson<StaffSession>("/auth/me", {
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        localStorage.setItem("protech_staff", JSON.stringify(staff));
        setStaffName(staff.name);
        setAvatarInitial(staff.name.trim().charAt(0).toUpperCase() || "A");
        setStaffModules(Array.isArray(staff.modules) ? staff.modules : []);
        scheduleSessionExpiry(staff.sessionExpiresAt);
        setLoading(false);
      } catch (_error) {
        if (cancelled) {
          return;
        }

        showSessionExpired();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

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
            w-full h-11 rounded-xl bg-[#2F66C5]
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
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">
        {sessionExpiredModal}
        กำลังโหลด...
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
                flex h-10 w-10 items-center justify-center

                rounded-lg

                bg-[#3D71BC]
                text-white

                shadow-sm

                transition-all
                duration-200
                ease-in-out

                hover:scale-105
                hover:bg-[#3564A8]
                hover:shadow-md
                hover:opacity-95

                active:scale-95

                focus:outline-none
                focus:ring-2
                focus:ring-[#3D71BC]
                focus:ring-offset-2

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

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-gray-700">
                  {staffName}
                </p>

                <p className="text-xs text-gray-400">เจ้าหน้าที่</p>
              </div>

              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-full bg-white
                  text-sm font-bold text-[#2F66C5]
                  shadow-sm
                "
              >
                {avatarInitial}
              </div>

              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-gray-200
                  bg-white
                  text-gray-500
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-red-50
                  hover:text-red-500
                  hover:border-red-200
                  active:scale-95
                  focus:outline-none
                "
                title="ออกจากระบบ"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>
 
          <main
            className="
              min-w-0 flex flex-1 flex-col
              overflow-x-auto
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
          <p className="text-gray-500 text-sm">
            คุณต้องการออกจากระบบ ProTech Support ใช่หรือไม่?
          </p>
          <div className="flex w-full gap-3 mt-4">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(false)}
              className="
                flex-1 h-11 rounded-xl border border-gray-200 bg-white
                text-sm font-semibold text-gray-700
                transition duration-200 hover:bg-gray-50 active:scale-[0.98]
              "
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex-1 h-11 rounded-xl bg-[#2F66C5]
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

      {/* Legacy Session Expired Modal */}
      <AdminModalShell
        open={false}
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
            <p className="text-sm font-semibold text-gray-800">Session หมดอายุแล้ว</p>
            <p className="mt-1 text-sm text-gray-500">
              คุณไม่ได้ใช้งานระบบเป็นเวลานาน<br />กรุณาเข้าสู่ระบบใหม่อีกครั้ง
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="
              w-full h-11 rounded-xl bg-[#2F66C5]
              text-sm font-semibold text-white
              transition duration-200 hover:bg-[#3564A8] active:scale-[0.98]
            "
          >
            กลับสู่หน้า Login
          </button>
        </div>
      </AdminModalShell>
    </div>
  );
}
