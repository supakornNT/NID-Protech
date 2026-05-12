import type { Metadata } from "next";

import "./globals.css";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });
const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ProTech Staff",
  description: "ProTech staff portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn("h-full antialiased font-sans", notoSans.variable, playfairDisplayHeading.variable, geistSans.variable, geistMono.variable)}>
      <body className="min-h-screen bg-[#E9EEF5]">{children}</body>
    </html>
  );
}
