"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChartBar,
  ChevronDown,
  List,
  FileText,
  ChartPie,
  Home,
  ShieldAlert,
  ShieldCheck,
  FolderCheck,
  Siren,
  Rss,
  X,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "หน้าหลัก",
    href: "/home",
    icon: Home,
  },
  {
    title: "รับเรื่องเเละคัดกรอง",
    icon: FolderCheck,
    children: [
      {
        title: "ประเด็นปัญหา",
        href: "/screening/issues",
        icon: ShieldAlert,
      },
      {
        title: "ข้อร้องเรียน",
        href: "/screening/complaints",
        icon: Siren,
      },
    ],
  },
  {
    title: "การพิจารณา",
    icon: List,
    children: [
      {
        title: "พิจารณาออกใบงาน",
        href: "/consideration/issue-work",
        icon: Rss,
      },
      {
        title: "พิจารณาปิดงาน",
        href: "/consideration/close-work",
        icon: Rss,
      },
    ],
  },
  {
    title: "การติดตาม",
    icon: List,
    children: [
      {
        title: "ติดตามสถานะการดำเนินการ",
        href: "/tracking/status",
        icon: Rss,
      },
    ],
  },
  {
    title: "การปฎิบัติงาน",
    icon: List,
    children: [
      {
        title: "ผลการปฎิบัติงาน",
        href: "/operations",
        icon: Rss,
      },
    ],
  },
  {
    title: "รายงาน",
    icon: FileText,
    children: [
      {
        title: "สำหรับผู้บริหาร",
        href: "/reports/executive",
        icon: ChartBar,
      },
      {
        title: "การปฎิบัติงาน",
        href: "/reports/operations",
        icon: ChartPie,
      },
      {
        title: "ประวัติการเเก้ไข",
        href: "/reports/edit-history",
        icon: ChartPie,
      },
      {
        title: "รายงานประวัติการเข้าใช้งานระบบ",
        href: "/reports/login-history",
        icon: ChartPie,
      },
    ],
  },
  {
    title: "จัดการ",
    icon: FileText,
    children: [
      {
        title: "จัดการข้อมูลองค์กรที่เกี่ยวข้อง",
        href: "/management/organizations",
        icon: ChartBar,
      },
      {
        title: "จัดการระบบโครงการเเละระบบงาน",
        href: "/management/systems",
        icon: ChartPie,
      },
      {
        title: "บริหารจัดการข้อมูลลงทะเบียนผู้เเจ้งประเด็น",
        href: "/management/reporters",
        icon: ChartPie,
      },
      {
        title: "จัดการข้อมูลลงทะเบียนทีมเเก้ไข",
        href: "/management/teams",
        icon: ChartPie,
      },
      {
        title: "จัดการกลุ่มผู้ใช้งาน",
        href: "/management/user-groups",
        icon: ChartPie,
      },
      {
        title: "จัดการสิทธิผู้ใช้งานจำเเนกตามกลุ่ม",
        href: "/management/permissions",
        icon: ChartPie,
      },
      {
        title: "จัดการข้อมูลผู้ใช้งาน",
        href: "/management/users",
        icon: ChartPie,
      },
      {
        title: "จัดการรูปเเบบประเด็นเเละข้อร้องเรียน",
        href: "/management/issue-and-complaint-types",
        icon: ChartPie,
      },
    ],
  },
];

type Props = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export default function StaffSidebar({
  mobileOpen,
  onMobileOpenChange,
}: Props) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex min-h-full flex-col px-4 py-8">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18">
          <ShieldCheck size={24} />
        </div>

        <div className="leading-tight">
          <p className="text-[18px] font-bold">
            ProTech
          </p>

          <p className="text-[18px] font-bold">
            Support
          </p>
        </div>
      </div>

      <nav className="space-y-2.5 text-[13px] font-semibold">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isOpen = item.children.some((child) =>
              pathname.startsWith(child.href),
            );

            return (
              <Collapsible
                key={item.title}
                defaultOpen={isOpen}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                      isOpen
                        ? "bg-white/20"
                        : "hover:bg-white/15"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={17} />
                      {item.title}
                    </span>

                    <ChevronDown size={15} />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-1.5 pl-3">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;

                    const active =
                      pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() =>
                          onMobileOpenChange(false)
                        }
                        className={`flex min-h-9 items-center gap-2 rounded-xl px-3 py-2 text-[12px] leading-snug transition ${
                          active
                            ? "bg-white/30 text-white"
                            : "hover:bg-white/15"
                        }`}
                      >
                        <ChildIcon size={14} />

                        <span>{child.title}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() =>
                onMobileOpenChange(false)
              }
              className={`flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 transition ${
                active
                  ? "bg-white/20"
                  : "hover:bg-white/15"
              }`}
            >
              <Icon size={17} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 overflow-y-auto bg-[#3D71BC] text-white lg:block">
        {sidebarContent}
      </aside>

      {/* mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              onMobileOpenChange(false)
            }
          />

          <aside className="relative h-full w-[82vw] max-w-[300px] overflow-y-auto bg-[#3D71BC] text-white shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-2 text-white hover:bg-white/15"
              onClick={() =>
                onMobileOpenChange(false)
              }
            >
              <X size={22} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}