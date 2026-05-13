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
  ClipboardClock,
  Rss,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Children } from "react";

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
        href: "/operations/results",
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
        title: "ประวัติการเข้าสู่ระบบ",
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
        title: "ข้อมูลองค์กร",
        href: "/management/organizations",
        icon: ChartBar,
      },
      {
        title: "ระบบงาน",
        href: "/management/systems",
        icon: ChartPie,
      },
      {
        title: "ข้อมูลลงทะเบียนผู้เเจ้งประเด็น",
        href: "/management/reporters",
        icon: ChartPie,
      },
      {
        title: "ข้อมูลลงทะเบียนทีมเเก้ไข",
        href: "/management/teams",
        icon: ChartPie,
      },
      {
        title: "กลุ่มผู้ใช้งาน",
        href: "/management/user-groups",
        icon: ChartPie,
      },
      {
        title: "สิทธิผู้ใช้งาน",
        href: "/management/permissions",
        icon: ChartPie,
      },
      {
        title: "ข้อมูลผู้ใช้งาน",
        href: "/management/users",
        icon: ChartPie,
      },
      {
        title: "รูปเเบบประเด็น",
        href: "/management/issue-types",
        icon: ChartPie,
      },
      {
        title: "รูปเเบบข้อร้องเรียน",
        href: "/management/complaint-types",
        icon: ChartPie,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 overflow-y-auto bg-[#3670BF] text-white">
      <div className="flex min-h-full flex-col px-5 py-8">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <ShieldCheck size={26} />
          </div>

          <div className="leading-tight">
            <p className="text-lg font-bold">ProTech</p>
            <p className="text-lg font-bold">Support</p>
          </div>
        </div>

        <nav className="space-y-3 text-sm font-semibold">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = item.children.some((child) =>
                pathname.startsWith(child.href),
              );

              return (
                <Collapsible key={item.title} defaultOpen={isOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                        isOpen ? "bg-white/20" : "hover:bg-white/15"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={18} />
                        {item.title}
                      </span>

                      <ChevronDown size={16} />
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-2 space-y-2 pl-4">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs leading-snug transition ${
                            active
                              ? "bg-white/30 text-white"
                              : "hover:bg-white/15"
                          }`}
                        >
                          <ChildIcon size={15} />
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
                className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 transition ${
                  active ? "bg-white/20" : "hover:bg-white/15"
                }`}
              >
                <Icon size={18} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
