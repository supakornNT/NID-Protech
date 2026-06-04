import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดตามสถานะคำขอ | ProTech Support",
};

export default function TrackLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-white">
      <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-[15px] font-semibold text-[#1B3D72]">ProTech Support</p>
      </header>
      <main>{children}</main>
    </div>
  );
}
