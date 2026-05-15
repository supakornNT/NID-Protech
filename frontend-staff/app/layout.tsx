import type { Metadata } from "next";
import type { CSSProperties } from "react";

import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ProTech Staff",
  description: "ProTech staff portal",
};

const rootStyle = {
  "--font-sans": "ui-sans-serif, system-ui, sans-serif",
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn("font-sans")} style={rootStyle}>
      <body className="min-h-screen bg-[#ffffff]">{children}</body>
    </html>
  );
}
