"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ClipboardList,
  FolderKanban,
  Home,
  ShieldCheck,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Wrench,
  Settings,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "หน้าหลัก",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "จัดการผู้ใช้และสิทธิ์",
    icon: UserCog,
    children: [
      {
        title: "จัดการข้อมูลลงทะเบียนผู้แจ้งประเด็น",
        href: "/management/customers",
        icon: UserPlus,
      },
      {
        title: "จัดการกลุ่มผู้ใช้งาน",
        href: "/management/user-groups",
        icon: Users,
      },
      {
        title: "จัดการสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม",
        href: "/management/permissions",
        icon: ShieldCheck,
      },
      {
        title: "จัดการข้อมูลผู้ใช้งาน",
        href: "/management/users",
        icon: User,
      },
      {
        title: "จัดการข้อมูลลงทะเบียนทีมแก้ไขประเด็น",
        href: "/management/teams",
        icon: Wrench,
      },
    ],
  },
  {
    title: "จัดการโครงสร้างระบบ",
    icon: Settings,
    children: [
      {
        title: "จัดการข้อมูลองค์กร",
        href: "/system-management/organizations",
        icon: Building2,
      },
      {
        title: "จัดการโครงการ",
        href: "/system-management/projects",
        icon: FolderKanban,
      },
      {
        title: "จัดการรูปแบบประเด็นและคำร้อง",
        href: "/system-management/problem-types",
        icon: AlertCircle,
      },
    ],
  },
  {
    title: "ประวัติการเข้าใช้งาน",
    href: "/login-logs",
    icon: ClipboardList,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 overflow-y-auto bg-[#3670BF] text-white">
      <div className="flex min-h-full flex-col px-5 py-8">
        <div className="mb-10 flex items-center px-2">
          <Image
            src={`${basePath}/ProTechLogoFinal.png`}
            alt="ProTech Support"
            width={136}
            height={39}
            priority
            className="h-auto w-auto object-contain"
          />
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
                      className={`group flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                        isOpen ? "bg-white/20" : "hover:bg-white/15"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={18} />
                        {item.title}
                      </span>

                      <ChevronDown
                        size={16}
                        className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
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
