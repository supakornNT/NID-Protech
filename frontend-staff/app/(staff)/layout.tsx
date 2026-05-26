"use client";

import { useState } from "react";

import { Menu } from "lucide-react";

import StaffSidebar from "@/components/sidebar/staff-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB]">
      <div className="flex min-h-screen w-full bg-white">
        <StaffSidebar
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
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
                  Screener User
                </p>

                <p className="text-xs text-gray-400">ผู้คัดกรอง</p>
              </div>

              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-full bg-white
                  text-sm font-bold text-[#2F66C5]
                  shadow-sm
                "
              >
                A
              </div>
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
    </div>
  );
}
