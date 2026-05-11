"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderKanban,
  Home,
  List,
  ShieldCheck,
  UserCheck,
  Users,
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
    title: "จัดการผู้ใช้และสิทธิ์",
    icon: UserCheck,
    children: [
      {
        title: "จัดการข้อมูลลงทะเบียนผู้แจ้งประเด็น",
        href: "/admin/management/customers",
        icon: List,
      },
      {
        title: "จัดการกลุ่มผู้ใช้งาน",
        href: "/admin/management/user-groups",
        icon: Users,
      },
      {
        title: "จัดการสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม",
        href: "/admin/management/permissions",
        icon: ShieldCheck,
      },
      {
        title: "จัดการข้อมูลผู้ใช้งาน",
        href: "/admin/management/users",
        icon: UserCheck,
      },
      {
        title: "จัดการข้อมูลลงทะเบียนทีมแก้ไขประเด็น",
        href: "/admin/management/teams",
        icon: Users,
      },
    ],
  },
  {
    title: "จัดการโครงสร้างระบบ",
    icon: FileText,
    children: [
      {
        title: "จัดการข้อมูลองค์กร",
        href: "/admin/system-management/organizations",
        icon: Building2,
      },
      {
        title: "จัดการโครงการ",
        href: "/admin/system-management/projects",
        icon: FolderKanban,
      },
      {
        title: "จัดการรูปแบบประเด็นและคำร้อง",
        href: "/admin/system-management/problem-types",
        icon: FileText,
      },
    ],
  },
  {
    title: "ประวัติการเข้าใช้งาน",
    href: "/admin/login-logs",
    icon: ClipboardList,
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
                pathname.startsWith(child.href)
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
